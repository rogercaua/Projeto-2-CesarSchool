using System.Globalization;
using System.Text;

namespace EcoTag.Core.Utils
{
    public static class ValueNormalizer
    {
        public static string NormalizeKey(string value)
        {
            var trimmed = value.Trim().ToLowerInvariant();
            var normalized = trimmed.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder();

            foreach (var character in normalized)
            {
                var category = CharUnicodeInfo.GetUnicodeCategory(character);

                if (category != UnicodeCategory.NonSpacingMark)
                {
                    builder.Append(character);
                }
            }

            return builder.ToString().Normalize(NormalizationForm.FormC);
        }

        public static bool IsAllowed(string value, IEnumerable<string> allowedValues)
        {
            return allowedValues.Contains(NormalizeKey(value));
        }
    }
}
