using System.Text.Json;
using System.Text.Json.Serialization;

namespace OnlyESBservice.Helpers
{
    public static class JsonHelper
    {
        public static readonly JsonSerializerOptions CamelCaseIgnoreNull = new JsonSerializerOptions
        {
            #if NET7_0_OR_GREATER
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            #else
                IgnoreNullValues = true,
            #endif
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }
}
