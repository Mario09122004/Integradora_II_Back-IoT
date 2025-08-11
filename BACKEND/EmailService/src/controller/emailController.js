import transporter from "../config/emailConfig.js";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoUJEDPath = path.join(__dirname, '../views/photos/LOGOUJEDComplete.png');
const logoLabPath = path.join(__dirname, '../views/photos/LOGOIICRed.png');

const logoUJED = fs.readFileSync(logoUJEDPath, 'base64');
const imgUJED = `data:image/png;base64,${logoUJED}`;

const logoLab = fs.readFileSync(logoLabPath, 'base64');
const imgLab = `data:image/png;base64,${logoLab}`;

export const sendEmail = async (req, res) => {
    const { to, subject, nombre } = req.body;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            template: 'email', 
            context: { to, subject, nombre }
        });

        return res.json({ message: 'Correo enviado con éxito' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export async function sendEmailWelcome(to, password){
    let subject = "Bienvenid@";
    let username = to;
    let pass =  password;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            template: 'welcome',
            context: { username, pass },
            attachments: [
                {
                    filename: 'LOGOIICwhite.png',
                    path: path.resolve(__dirname, '../views/photos/LOGOIICwhite.png'),
                    cid: 'logoHeader'
                },
                {
                    filename: 'LOGOUJED.png',
                    path: path.resolve(__dirname, '../views/photos/LOGOUJED.png'),
                    cid: 'logoFooter'
                }
            ]
        });

    } catch (error) {
        console.log(error);
    }
};

export async function sendEmailForgetPassword(to, newPass){
    let subject = "Recuperación de contraseña";
    let username = to;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            template: 'recover',
            context: { username, newPass },
            attachments: [
                {
                    filename: 'LOGOIICwhite.png',
                    path: path.resolve(__dirname, '../views/photos/LOGOIICwhite.png'),
                    cid: 'logoHeader'
                },
                {
                    filename: 'LOGOUJED.png',
                    path: path.resolve(__dirname, '../views/photos/LOGOUJED.png'),
                    cid: 'logoFooter'
                }
            ]
        });

    } catch (error) {
        console.log(error);
    }
};

export async function sendEmailResultadosConPDF({ email, muestra }) {
    const subject = "Resultados de análisis de laboratorio";
    const username = muestra.nombrePaciente;
    let htmlPDF = ""

    htmlPDF = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    font-size: 10px;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 25px;
                    border: 1px solid #e0e0e0;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 10px;
                }
                .header .logo-left {
                    width: 80px;
                }
                .header .logo-right {
                    width: 70px;
                }
                .header .title-block {
                    text-align: center;
                }
                .header .main-title {
                    font-size: 14px;
                    font-weight: bold;
                    margin: 0;
                }
                .header .subtitle {
                    font-size: 12px;
                    margin: 5px 0 0 0;
                    font-weight: bold;
                }
                .section-line {
                    border: 0;
                    border-top: 1.5px solid #ccc;
                    margin: 15px 0;
                }
                .patient-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .patient-info p {
                    margin: 2px 0;
                    font-size: 11px;
                }
                .results-section h2 {
                    text-align: center;
                    background-color:#bf1616;
                    padding: 8px;
                    margin: 20px 0 0 0;
                    font-size: 14px;
                    font-weight: bold;
                    border: 1px solid #dcdcdc;
                }
                .results-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                .results-table th, .results-table td {
                    padding: 6px 4px;
                    text-align: left;
                    vertical-align: top;
                }
                .results-table thead th {
                    text-align: left;
                    font-size: 11px;
                    font-weight: bold;
                    color: #555;
                    padding-bottom: 10px;
                }
                .results-table tbody tr:not(:last-child) td {
                    border-bottom: 1px dotted #ccc;
                }
                .results-table .col-estudio { width: 25%; font-weight: bold; }
                .results-table .col-resultado { width: 5%; text-align: left; }
                .results-table .col-normales { width: 55%; text-align: right; }
                
                .observations {
                    margin-top: 20px;
                }
                .observations p {
                    margin: 0;
                    font-size: 11px;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                }
                .footer .signature {
                    margin-bottom: 5px;
                }
                .footer .signature-name {
                    font-weight: bold;
                    font-size: 11px;
                }
                .footer .signature-title {
                    font-size: 10px;
                }
                .footer .contact-info {
                    margin-top: 15px;
                    font-size: 9px;
                    color: #555;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header class="header">
                    <img src="${imgUJED}" alt="Logo UJED" class="logo-left">
                    <div class="title-block">
                        <p class="main-title">INSTITUTO DE INVESTIGACIÓN CIENTÍFICA</p>
                        <p class="main-title">"Dr. Roberto Rivera Damm"</p>
                        <p class="subtitle">LABORATORIO</p>
                    </div>
                    <img src="${imgLab}" alt="Logo IIC" class="logo-right">
                </header>

                <hr class="section-line">

                <section class="patient-info">
                    <div>
                        <p><strong>Doctor:</strong> A quien corresponda</p>
                        <p><strong>Nombre:</strong> ${muestra.nombrePaciente}</p>
                        <p><strong>Fecha de toma:</strong> ${new Date(muestra.fechaTomaMuestra).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                    </div>
                </section>

                ${muestra.quimicaSanguinea ? `
                <div class="results-section">
                    <h2 style="color:white">QUIMICA SANGUINEA</h2>
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th class="col-estudio"></th>
                                <th class="col-resultado">Resultado</th>
                                <th class="col-normales">Valores Normales</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Glucosa</td>
                                <td>${muestra.quimicaSanguinea.glucosa} mg/dl</td>
                                <td>70-110 mg/dl</td>
                            </tr>
                            <tr>
                                <td>Glucosa Post</td>
                                <td>${muestra.quimicaSanguinea.glucosaPost} mg/dl</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Ácido Úrico</td>
                                <td>${muestra.quimicaSanguinea.acidoUrico} mg/dl</td>
                                <td>2.1-7.4 mg/dl</td>
                            </tr>
                            <tr>
                                <td>Urea</td>
                                <td>${muestra.quimicaSanguinea.urea} mg/dl</td>
                                <td>25-43 mg/dl</td>
                            </tr>
                            <tr>
                                <td>Creatinina</td>
                                <td>${muestra.quimicaSanguinea.creatinina} mg/dl</td>
                                <td>0.5-1.5 mg/dl</td>
                            </tr>
                            <tr>
                                <td>Colesterol</td>
                                <td>${muestra.quimicaSanguinea.colesterol} mg/dl</td>
                                <td>
                                    nivel satisfactorio: hasta 200 mg/dl<br>
                                    nivel sospechoso: 201-240 mg/dl<br>
                                    nivel alto riesgo: mayor de 240 mg/dl
                                </td>
                            </tr>
                            <tr>
                                <td>LDH</td>
                                <td>${muestra.quimicaSanguinea.LDR}</td>
                                <td>Adultos 270-414 VIL</td>
                            </tr>
                            <tr>
                                <td>g-GT</td>
                                <td>${muestra.quimicaSanguinea.gGT}</td>
                                <td>M &lt; 38.0 H &lt; 55.0 VIL</td>
                            </tr>
                        </tbody>
                    </table>
                </div>` : ''}
                ${muestra.biometriaHematica ? `
                <div class="results-section">
                    <h2 style="color:white">Biometría Hemática</h2>
                    <table>
                        <thead>
                            <tr>
                                <th class="col-estudio">Formula Roja</th>
                                <th class="col-resultado">Resultado</th>
                                <th class="col-normales">Valores Normales</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Hemoglobina</td>
                                <td>${muestra.biometriaHematica.formulaRoja.hemoglobina}</td>
                                <td>13-17 g/dl</td>
                            </tr>
                            <tr>
                                <td>Hematocrito</td>
                                <td>${muestra.biometriaHematica.formulaRoja.hematocrito}</td>
                                <td>35-50%</td>
                            </tr>
                            <tr>
                                <td>Eritrocitos</td>
                                <td>${muestra.biometriaHematica.formulaRoja.eritrocitos}</td>
                                <td>4.5-5.5Mill/mm3</td>
                            </tr>
                            <tr>
                                <td>Con. Media Hb</td>
                                <td>${muestra.biometriaHematica.formulaRoja.conMediaHb}</td>
                                <td>28-32</td>
                            </tr>
                            <tr>
                                <td>Vol. Globular Media</td>
                                <td>${muestra.biometriaHematica.formulaRoja.volGlobularMedia}</td>
                                <td>80-94u3</td>
                            </tr>
                            <tr>
                                <td>HB. Corpuscular Media</td>
                                <td>${muestra.biometriaHematica.formulaRoja.HBCorpuscularMedia}</td>
                                <td>27-31uug</td>
                            </tr>
                            <tr>
                                <td>Plaquetas</td>
                                <td>${muestra.biometriaHematica.formulaRoja.plaqutas}</td>
                                <td>150000-350000/mm3</td>
                            </tr>
                        </tbody>
                        <thead>
                            <tr>
                                <th class="col-estudio">Formula Blanca</th>
                                <th class="col-resultado">Resultado</th>
                                <th class="col-normales">Valores Normales</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Cuenta Leucocitaria</td>
                                <td>${muestra.biometriaHematica.formulaBlanca.cuentaLeucocitaria} </td>
                                <td>5000-10000/mm</td>
                            </tr>
                            <tr>
                                <td>Linfocitos</td>
                                <td>${muestra.biometriaHematica.formulaBlanca.linfocitos} </td>
                                <td>21-30%</td>
                            </tr>
                            <tr>
                                <td>Monocitos</td>
                                <td>${muestra.biometriaHematica.formulaBlanca.monocitos} </td>
                                <td>4-8%</td>
                            </tr>
                            <tr>
                                <td>Segmentados</td>
                                <td>${muestra.biometriaHematica.formulaBlanca.segmentados} </td>
                                <td>58-66%</td>
                            </tr>
                            <tr>
                                <td>En Banda</td>
                                <td>${muestra.biometriaHematica.formulaBlanca.enBanda} </td>
                                <td>3-5%</td>
                            </tr>
                            <tr>
                                <td>Neutrofilos T.</td>
                                <td>${muestra.biometriaHematica.formulaBlanca.neutrofilosT} </td>
                                <td>60-70%</td>
                            </tr>
                            <tr>
                                <td>Eosinófilos</td>
                                <td>${muestra.biometriaHematica.formulaBlanca.eosinofilos} </td>
                                <td>1-4%</td>
                            </tr>
                            <tr>
                                <td>Basófilos</td>
                                <td>${muestra.biometriaHematica.formulaBlanca.basofilos} </td>
                                <td>0-1%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>` : ''}

                <section class="observations">
                    <p><strong>Observaciones:</strong> ${muestra.observaciones || 'Ninguna'}</p>
                </section>
                
                <hr class="section-line">

                <footer class="footer">
                    <br>
                    <br>
                    <br>
                    <br>
                    <div class="signature">
                    <p>_______________________________________</p>
                    <br>
                        <p class="signature-name">M.G.A. Elizabeth I. Antuna Salcido céd: 11918982</p>
                        <p class="signature-title">Jefe de Laboratorio</p>
                    </div>
                    <div class="contact-info">
                        <p>Av. Universidad esq. Con Volantín Col. Centro C.P. 34000</p>
                        <p>Tels. (618) 827 12 16, (618) 827 12 58. Durango, Dgo., Méx.</p>
                        <p>e-mail: lic@ujed.mx</p>
                    </div>
                </footer>

            </div>
        </body>
        </html>
    `;

    // 🖨️ Generar PDF en memoria con Puppeteer
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlPDF, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 📧 Enviar correo
    try {
        await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        template: 'resultados',
        context: { username, muestra },
        attachments: [
            {
            filename: `Resultados_${muestra._id}.pdf`,
            content: pdfBuffer
            },
            {
            filename: 'LOGOIICwhite.png',
            path: path.resolve(__dirname, '../views/photos/LOGOIICwhite.png'),
            cid: 'logoHeader'
            },
            {
            filename: 'LOGOUJED.png',
            path: path.resolve(__dirname, '../views/photos/LOGOUJED.png'),
            cid: 'logoFooter'
            }
        ]
        });
    } catch (error) {
        console.error("❌ Error al enviar el correo con PDF:", error);
    }
}