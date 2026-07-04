import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { ProductsCacheService } from '../products/products-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesCacheService } from './categories-cache.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

type CategoryWithCount = Category & {
  _count: { products: number };
};

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CategoriesCacheService,
    @Inject(forwardRef(() => ProductsCacheService))
    private readonly productsCache: ProductsCacheService,
  ) {}

  async findAll(search?: string): Promise<CategoryWithCount[]> {
    const cached = await this.cache.getList<CategoryWithCount[]>(search);

    if (cached) {
      return cached;
    }

    const where = this.buildSearchFilter(search);
    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });

    await this.cache.setList(search, categories);
    return categories;
  }

  async findOne(id: number): Promise<CategoryWithCount> {
    const cached = await this.cache.getItem<CategoryWithCount>(id);

    if (cached) {
      return cached;
    }

    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new NotFoundException(`Categoria ${id} não encontrada.`);
    }

    await this.cache.setItem(id, category);
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.create({ data: dto });
    await this.cache.invalidateAllCategories();
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id);

    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    await this.cache.invalidateCategory(id);
    await this.productsCache.invalidateAll();
    return category;
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    if (category._count.products > 0) {
      throw new ConflictException(
        'Não é possível excluir uma categoria com produtos vinculados.',
      );
    }

    await this.prisma.category.delete({ where: { id } });
    await this.cache.invalidateCategory(id);
    await this.productsCache.invalidateAll();
  }

  private buildSearchFilter(search?: string): Prisma.CategoryWhereInput {
    if (!search) {
      return {};
    }

    return { name: { contains: search, mode: 'insensitive' } };
  }
}
