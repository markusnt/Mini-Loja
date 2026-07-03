import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListProductsQueryDto } from './dto/list-products.query.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PaginatedResponse } from './types/paginated-response.type';

type ProductWithCategory = Product & {
  category: { id: number; name: string };
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ListProductsQueryDto,
  ): Promise<PaginatedResponse<ProductWithCategory>> {
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

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: total > 0 ? Math.ceil(total / limit) : 1,
      },
    };
  }

  async findOne(id: number): Promise<ProductWithCategory> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Produto ${id} não encontrado.`);
    }

    return product;
  }

  async create(dto: CreateProductDto): Promise<ProductWithCategory> {
    await this.ensureCategoryExists(dto.categoryId);

    return this.prisma.product.create({
      data: dto,
      include: { category: true },
    });
  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<ProductWithCategory> {
    await this.findOne(id);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
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
