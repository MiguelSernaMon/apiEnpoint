const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const { PassThrough } = require('stream');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const authenticate = async () => {
  try {
    const response = await axios.post('https://qa-helpharma-p2h-apigateway-back.azurewebsites.net/auth/authenticate', {
      username: 'pruebaenvio',
      password: 'prueba123'
    });

    const token = response.data.token;
    return token;
  } catch (error) {
    console.error(error);
  }
};

const updateStatusOrders = async (token, orderNumber, orderStatus, provider, motivoDevolucion, imageUrl) => {
  try {
    let formData = new FormData();
    formData.append('NumeroPedido', orderNumber);
    formData.append('EstadoPedido', orderStatus);
    formData.append('Prestador', provider);

    if (orderStatus === 2 && motivoDevolucion) {
      if(
        motivoDevolucion === "Dirección incorrecta" || motivoDevolucion === "Fuera de zona" ||
        motivoDevolucion === "Zona Roja no Foto" ){

          motivoDevolucion = 1;
       
        }
      else if (
        motivoDevolucion === "No hay usuario que firme RECIBIDO" || 
        motivoDevolucion === "No quiere recibir el paquete" ||
        motivoDevolucion === "No responde llamada" ||
        motivoDevolucion === "No se entrega menor de edad" ||
        motivoDevolucion === "Remisión y Sticker no coinciden" ||
        motivoDevolucion === "Saca Helpharma" ||
        motivoDevolucion === "Usuario Ausente" 
      ){
        motivoDevolucion = 2;
      }else{
        motivoDevolucion = 3;
      }

      formData.append('MotivoDevolucion', motivoDevolucion);
    }
    if (Object.keys(motivoDevolucion).length === 0) {
      formData.append('MotivoDevolucion', 0);
    }
    if (imageUrl) {
      // Fetch the image from the URL
      const response = await axios.get(imageUrl, {responeType: 'stream'})

      // Create a new ReadableStream
      // const file = new PassThrough();
      // response.data.pipe(file);

      // Append the image to the form data
      formData.append("image", response.data, "image.jpg")
    }

    const response = await axios.put('https://qa-helpharma-p2h-apigateway-back.azurewebsites.net/distribution/updateStatusOrdersSupport', formData, {
      headers: {
        'usuario': 'pruebaenvio',
        'token': token,
        ...formData.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

app.post('/detailed-checkout', async(req, res) => {
   if (!req.body) {
    return res.status(400).send({ error: 'No se recibió ningún dato' });
  }

  // Si se recibió el JSON correctamente
    let { pictures, status, id } = req.body[0]
    let {checkout_time,  created} = req.body[0]
    checkout_time = checkout_time.split(".")[0];
    created = created.split(".")[0];
    pictures = pictures[0];
    status = status === "completed" ? 1 : 2;

    const token = await authenticate();

    const statusUp =  updateStatusOrders(token, id, status, 2, "Dirección incorrecta", pictures);
    console.log("Token", token);
    console.log("id", id);
    
    return res.status(200).send({ message: 'Datos recibidos exitosamente', statusUp });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
