import Analisis from './../models/analisismodel.js';

export const getAllAnalysis = async (req, res) => {
    const analisysList = await Analisis.find();
    return res.json({ analisysList });
}

export const saveAnalysis = async (req, res) => {
    const { nombre, costo, diasEspera, descripcion } = req.body;

    // Validar que estén todos los campos
    const requiredFields = [
        'nombre', 'costo', 'diasEspera', 'descripcion'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: `Faltan los siguientes campos: ${missingFields.join(', ')}`
        });
    }

    //Validación nombre
    if (!isNaN(nombre)) {
        return res.status(400).json({ message: 'El nombre debe ser una cadena de caracteres' });
    }

    //Validación costo
    if (isNaN(costo)) {
        return res.status(400).json({ message: 'El costo debe de ser un número' });
    }
    if (costo<=0) {
        return res.status(400).json({ message: 'El costo debe ser un número positivo' });
    }

    //Validación dias de espera
    if (isNaN(diasEspera)) {
        return res.status(400).json({ message: 'Los dias de espera deben de ser un número' });
    }
    if (diasEspera<=0) {
        return res.status(400).json({ message: 'Los dias de espera deben de ser un número positivo' });
    }

    //Validación descripción
    if (!isNaN(descripcion)) {
        return res.status(400).json({ message: 'La descripción debe ser una cadena de caracteres' });
    }

    try{
        const newAnalysis = new Analisis({
            nombre, 
            costo,
            diasEspera, 
            descripcion
        });
    
        const analysisSaved = await newAnalysis.save();
        return res.status(201).json({
            message: "Analisis guardado", Analisis: analysisSaved})
    } catch (error){
        return res.status(401).json({
            message: "Ocurrio un error al guardar",
            error
        })
    }
}

export const deleteAnalysis = async(req, res) => {
    const { analisysId } = req.params;

    const analisis = await Analisis.findById(analisysId);
    if (!analisis){
        return res.status(404).json({ message: "Analisis no encontrado."});
    }

    analisis.status=false;
    analisis.deleteDate= new Date;

    const deleteAnalysis = await analisis.save();
    return res.json({ deleteAnalysis });
}

export const updateAnalisys = async (req, res) => {
    const { analisysId } = req.params;
    const { nombre, costo, diasEspera, descripcion } = req.body;

    const analisis = await Analisis.findById(analisysId);
    if (!analisis){
        return res.status(404).json({ message: "Analisis no encontrado."});
    }

    if(!analisis.status){
        return res.status(400).json({ message: 'Analisis dada de baja' });
    }

    // Validación nombre
    if (nombre !== undefined) {
        if (typeof nombre !== 'string' || nombre.trim() === '' || !isNaN(nombre)) {
            return res.status(400).json({ message: 'El nombre debe ser una cadena de caracteres válida' });
        }
    }

    // Validación costo
    if (costo !== undefined) {
        if (isNaN(costo)) {
            return res.status(400).json({ message: 'El costo debe de ser un número' });
        }
        if (Number(costo) <= 0) {
            return res.status(400).json({ message: 'El costo debe ser un número positivo' });
        }
    }

    // Validación días de espera
    if (diasEspera !== undefined) {
        if (isNaN(diasEspera)) {
            return res.status(400).json({ message: 'Los días de espera deben de ser un número' });
        }
        if (Number(diasEspera) <= 0) {
            return res.status(400).json({ message: 'Los días de espera deben de ser un número positivo' });
        }
    }

    // Validación descripción
    if (descripcion !== undefined) {
        if (typeof descripcion !== 'string' || descripcion.trim() === '' || !isNaN(descripcion)) {
            return res.status(400).json({ message: 'La descripción debe ser una cadena de caracteres' });
        }
    }

    analisis.nombre = nombre != null ? nombre : analisis.nombre;
    analisis.costo = costo != null ? costo : analisis.costo;
    analisis.diasEspera=diasEspera != null ? diasEspera : analisis.diasEspera;
    analisis.descripcion=descripcion != null ? descripcion : analisis.descripcion;

    const updateAnalisis = await analisis.save();
    return res.json({ updateAnalisis });
}

export const getAnalysisById = async (req, res) => {
    const { analisysId } = req.params;

    const analisis = await Analisis.findById(analisysId);
    if (!analisis){
        return res.status(404).json({ message: "Analisis no encontrado."});
    }

    return res.status(200).json({
        analisis
    })

}

export const getAnalysisByName = async (req, res) => {
    const { analisysName } = req.params;

    const serch = new RegExp(analisysName, 'i');
    const analysisListByName = await Analisis.find({ nombre: serch });

    return res.json({ analysisListByName });
}