import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { CategoriesCacheService } from '../categories/categories-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { ListProductsQueryDto } from './dto/list-products.query.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsCacheService } from './products-cache.service';
import { PaginatedResponse } from './types/paginated-response.type';

type ProductWithCategory = Product & {
  category: { id: number; name: string };
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: ProductsCacheService,
    private readonly categoriesCache: CategoriesCacheService,
  ) {}

  async findAll(
    query: ListProductsQueryDto,
  ): Promise<PaginatedResponse<ProductWithCategory>> {
    const cached =
      await this.cache.getList<PaginatedResponse<ProductWithCategory>>(query);

    if (cached) {
      return cached;
    }

    const { page, limit, search } = query;
    const where = this.buildSearchFilter(search);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    const result: PaginatedResponse<ProductWithCategory> = {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: total > 0 ? Math.ceil(total / limit) : 1,
      },
    };

    await this.cache.setList(query, result);
    return result;
  }

  async findOne(id: number): Promise<ProductWithCategory> {
    const cached = await this.cache.getItem<ProductWithCategory>(id);

    if (cached) {
      return cached;
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Produto ${id} não encontrado.`);
    }

    await this.cache.setItem(id, product);
    return product;
  }

  async create(dto: CreateProductDto): Promise<ProductWithCategory> {
    await this.ensureCategoryExists(dto.categoryId);

    const product = await this.prisma.product.create({
      data: dto,
      include: { category: true },
    });

    await this.cache.invalidateAllProducts();
    await this.categoriesCache.invalidateCategory(dto.categoryId);
    return product;
  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<ProductWithCategory> {
    const existing = await this.findOne(id);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });

    await this.cache.invalidateProduct(id);

    const categoryIds = [existing.categoryId];
    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      categoryIds.push(dto.categoryId);
    }
    await this.categoriesCache.invalidateCategoriesByIds(categoryIds);

    return product;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    await this.cache.invalidateProduct(id);
    await this.categoriesCache.invalidateCategory(product.categoryId);
  }

  private buildSearchFilter(search?: string): Prisma.ProductWhereInput {
    if (!search) {
      return {};
    }

    return {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  private async ensureCategoryExists(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Categoria ${categoryId} não encontrada.`);
    }
  }
}
