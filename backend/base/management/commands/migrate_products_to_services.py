from django.core.management.base import BaseCommand
from base.models import Product
from services.models import Service

class Command(BaseCommand):
    help = 'Migrate Product rows from base.Product into services.Service'

    def handle(self, *args, **options):
        products = Product.objects.all()
        created = 0
        skipped = 0
        for p in products:
            # Check for existing service with same name and seller
            seller = p.user
            exists = Service.objects.filter(service_name=p.name, seller=seller).exists()
            if exists:
                skipped += 1
                self.stdout.write(self.style.WARNING(f"Skipped existing service for product {p._id}: {p.name}"))
                continue
            s = Service(
                seller=seller if seller is not None else None,
                service_name=p.name or '',
                description=p.description or '',
                price=p.price or 0,
                duration_of_service='',
            )
            # Move image field if present
            if getattr(p, 'image', None):
                s.sample_image = p.image
            s.save()
            created += 1
            self.stdout.write(self.style.SUCCESS(f"Created service for product {p._id}: {p.name}"))

        self.stdout.write(self.style.SUCCESS(f"Migration complete. Created: {created}, Skipped: {skipped}, Total processed: {products.count()}"))
