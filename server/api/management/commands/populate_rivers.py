from django.core.management.base import BaseCommand
from api.models import River

class Command(BaseCommand):
    help = 'Populate the database with sample river data'

    def handle(self, *args, **options):
        rivers = [
            {
                'name': 'Ganges',
                'location': 'Northern India - Uttarakhand to West Bengal',
                'quality_index': 72.5
            },
            {
                'name': 'Yamuna',
                'location': 'Northern India - Himalayas to Allahabad',
                'quality_index': 68.3
            },
            {
                'name': 'Narmada',
                'location': 'Central India - Madhya Pradesh to Gujarat',
                'quality_index': 81.2
            },
            {
                'name': 'Godavari',
                'location': 'Peninsular India - Maharashtra to Andhra Pradesh',
                'quality_index': 75.8
            },
            {
                'name': 'Krishna',
                'location': 'South India - Maharashtra to Andhra Pradesh',
                'quality_index': 73.6
            },
            {
                'name': 'Cauvery',
                'location': 'South India - Karnataka to Tamil Nadu',
                'quality_index': 79.4
            },
            {
                'name': 'Brahmaputra',
                'location': 'Northeast India - Tibet to Bay of Bengal',
                'quality_index': 77.1
            },
            {
                'name': 'Mahanadi',
                'location': 'East India - Chhattisgarh to Odisha',
                'quality_index': 74.2
            },
            {
                'name': 'Tapti',
                'location': 'Central India - Madhya Pradesh to Gujarat',
                'quality_index': 71.9
            },
            {
                'name': 'Sabarmati',
                'location': 'Western India - Rajasthan to Gujarat',
                'quality_index': 69.7
            }
        ]

        for river_data in rivers:
            river, created = River.objects.get_or_create(
                name=river_data['name'],
                defaults={
                    'location': river_data['location'],
                    'quality_index': river_data['quality_index']
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created river: {river.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'River already exists: {river.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Populated database with {len(rivers)} rivers')
        )