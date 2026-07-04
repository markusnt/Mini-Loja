import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Notebook', minLength: 2 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: '16GB RAM, SSD 512GB' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 3499.9, minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  categoryId!: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Notebook Pro', minLength: 2 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: '32GB RAM, SSD 1TB' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ example: 3299.9, minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  categoryId?: number;
}
