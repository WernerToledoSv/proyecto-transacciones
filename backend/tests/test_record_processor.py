"""Pruebas unitarias del procesador aislado de registros."""
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from app.core.exceptions import NormalizationError
from app.models.transaction import SourceType
from app.services.record_processor import process_record


class ProcessRecordTests(unittest.TestCase):
    @patch("app.services.record_processor.detect_source", return_value=SourceType.UNKNOWN)
    def test_unknown_source_returns_invalid_outcome(self, _detect):
        outcome = process_record({"field": "value"})

        self.assertFalse(outcome.is_valid)
        self.assertEqual(outcome.invalid_record.error_type, "UnknownSource")

    @patch("app.services.record_processor.get_normalizer", return_value=None)
    @patch("app.services.record_processor.detect_source", return_value=SourceType.STRIPE)
    def test_missing_normalizer_returns_invalid_outcome(self, _detect, _normalizer):
        outcome = process_record({"charge_id": "ch_1"})

        self.assertFalse(outcome.is_valid)
        self.assertEqual(outcome.invalid_record.error_type, "MissingNormalizer")

    @patch("app.services.record_processor.get_normalizer")
    @patch("app.services.record_processor.detect_source", return_value=SourceType.STRIPE)
    def test_normalization_error_returns_invalid_outcome(self, _detect, get_normalizer):
        normalizer = Mock()
        normalizer.normalize.side_effect = NormalizationError("monto inválido")
        get_normalizer.return_value = normalizer

        outcome = process_record({"charge_id": "ch_1"})

        self.assertFalse(outcome.is_valid)
        self.assertEqual(outcome.invalid_record.error_type, "NormalizationError")
        self.assertEqual(outcome.invalid_record.error_detail, "monto inválido")

    @patch("app.services.record_processor.validate")
    @patch("app.services.record_processor.get_normalizer")
    @patch("app.services.record_processor.detect_source", return_value=SourceType.STRIPE)
    def test_validation_errors_return_invalid_outcome(
        self, _detect, get_normalizer, validate
    ):
        transaction = object()
        normalizer = Mock()
        normalizer.normalize.return_value = transaction
        get_normalizer.return_value = normalizer
        validate.return_value = SimpleNamespace(
            is_valid=False, errors=["moneda no soportada"]
        )

        outcome = process_record({"charge_id": "ch_1"})

        self.assertFalse(outcome.is_valid)
        self.assertEqual(outcome.invalid_record.error_type, "ValidationError")
        self.assertEqual(outcome.invalid_record.error_detail, "moneda no soportada")

    @patch("app.services.record_processor.validate")
    @patch("app.services.record_processor.get_normalizer")
    @patch("app.services.record_processor.detect_source", return_value=SourceType.STRIPE)
    def test_valid_transaction_is_returned_without_persisting(
        self, _detect, get_normalizer, validate
    ):
        transaction = object()
        normalizer = Mock()
        normalizer.normalize.return_value = transaction
        get_normalizer.return_value = normalizer
        validate.return_value = SimpleNamespace(is_valid=True, errors=[])

        outcome = process_record({"charge_id": "ch_1"})

        self.assertTrue(outcome.is_valid)
        self.assertIs(outcome.transaction, transaction)
        self.assertIsNone(outcome.invalid_record)


if __name__ == "__main__":
    unittest.main()
