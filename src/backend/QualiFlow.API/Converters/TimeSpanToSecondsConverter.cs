using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace QualiFlow.API.Converters;

/// <summary>
/// JSON converter that serializes TimeSpan as total seconds (double).
/// This allows frontend to receive response times as numbers instead of string format.
/// </summary>
public class TimeSpanToSecondsConverter : JsonConverter<TimeSpan>
{
    public override TimeSpan Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            var seconds = reader.GetDouble();
            return TimeSpan.FromSeconds(seconds);
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            var value = reader.GetString();
            if (TimeSpan.TryParse(value, CultureInfo.InvariantCulture, out var result))
            {
                return result;
            }

            if (double.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var secondsFromString))
            {
                return TimeSpan.FromSeconds(secondsFromString);
            }
        }

        return TimeSpan.Zero;
    }

    public override void Write(Utf8JsonWriter writer, TimeSpan value, JsonSerializerOptions options)
    {
        // Write as total seconds (double) for easy frontend consumption
        writer.WriteNumberValue(value.TotalSeconds);
    }
}
