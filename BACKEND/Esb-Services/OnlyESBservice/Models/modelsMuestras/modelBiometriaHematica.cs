namespace OnlyESBservice.Models.modelsMuestras
{
    public class BiometriaHematica
    {
        public FormulaRoja? formulaRoja { get; set; }
        public FormulaBlanca? formulaBlanca { get; set; }
    }

    public class FormulaRoja
    {
        public double? hemoglobina { get; set; }
        public double? hematocrito { get; set; }
        public double? eritrocitos { get; set; }
        public double? conMediaHb { get; set; }
        public double? volGlobularMedia { get; set; }
        public double? HBCorpuscularMedia { get; set; }
        public double? plaqutas { get; set; }
    }

    public class FormulaBlanca
    {
        public double? cuentaLeucocitaria { get; set; }
        public double? linfocitos { get; set; }
        public double? monocitos { get; set; }
        public double? segmentados { get; set; }
        public double? enBanda { get; set; }
        public double? neutrofilosT { get; set; }
        public double? eosinofilos { get; set; }
        public double? basofilos { get; set; }
    }
}
