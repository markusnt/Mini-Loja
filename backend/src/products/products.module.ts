import { Module, forwardRef } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsCacheService } from './products-cache.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [forwardRef(() => CategoriesModule)],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsCacheService],
  exports: [ProductsCacheService],
})
export class ProductsModule {}
