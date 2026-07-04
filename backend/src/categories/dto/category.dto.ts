import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Eletrônicos', minLength: 2 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Informática', minLength: 2 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name?: string;
}
