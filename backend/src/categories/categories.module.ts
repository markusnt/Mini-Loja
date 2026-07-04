import { Module, forwardRef } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { CategoriesCacheService } from './categories-cache.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [forwardRef(() => ProductsModule)],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesCacheService],
  exports: [CategoriesService, CategoriesCacheService],
})
export class CategoriesModule {}
