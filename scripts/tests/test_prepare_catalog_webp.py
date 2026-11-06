import importlib.util
from pathlib import Path
import unittest
import hashlib
import tempfile

spec = importlib.util.spec_from_file_location('prepare_catalog_webp', Path(__file__).parents[1] / 'prepare_catalog_webp.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class CatalogWebpMappingTests(unittest.TestCase):
    def row(self, **values):
        return dict(id=1, file='2026/10/1234-5678_01-2.jpg', sha256='old', **values)

    def test_original_url_wins_over_shared_hash_alias(self):
        index = {'1234-5678_01': {'new': Path('1234-5678_01.webp')}, 'other': {'different': Path('other.webp')}}
        result = module.match_attachment(self.row(source_url='https://katukina.com/assets/1234-5678_01.jpg'), index, {'old': ['other.jpg']})
        self.assertEqual(result[:2], ('1234-5678_01', 'new'))

    def test_conflicting_category_copies_are_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Conflicting'):
            module.match_attachment(self.row(source_url='https://katukina.com/1234.webp'), {'1234': {'a': Path('a'), 'b': Path('b')}}, {})

    def test_ambiguous_content_alias_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Ambiguous'):
            module.match_attachment(self.row(), {'a': {'a': Path('a')}, 'b': {'b': Path('b')}}, {'old': ['a.jpg', 'b.jpg']})

    def test_does_not_guess_wordpress_filename_suffix(self):
        self.assertIsNone(module.match_attachment(self.row(), {'1234-5678_01': {'a': Path('a')}}, {}))

    def test_category_matching_handles_portuguese_and_ampersand(self):
        self.assertEqual(module.category_key('Beauty & Body'), module.category_key('beauty-and-body'))
        self.assertEqual(module.category_key('Rapé'), module.category_key('rape'))

    def test_primary_category_uses_form_images_and_excludes_description_collision(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory)
            direct = source / 'Beauty & Body' / 'Product' / '1234_02.webp'
            description = direct.parent / 'Imagens da descrição' / direct.name
            description.parent.mkdir(parents=True)
            direct.write_bytes(b'gallery')
            description.write_bytes(b'description')
            gallery_hash = hashlib.sha256(direct.read_bytes()).hexdigest()
            desc_hash = hashlib.sha256(description.read_bytes()).hexdigest()
            index = {'1234_02': {gallery_hash: direct, desc_hash: description}}
            catalog = {'items': {'1234': {'source_url': 'https://katukina.com/products/beauty-and-body/product', 'image_files': [], 'forms': {'sku': ['1234_02.jpg']}}}, 'unmatched': {}}
            resolved = module.resolve_primary(index, [direct, description], catalog, source)
            self.assertEqual(len(resolved), 1)
            self.assertEqual(index['1234_02'], {gallery_hash: direct})


if __name__ == '__main__':
    unittest.main()
