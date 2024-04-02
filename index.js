const express = require('express');
const axios = require('axios');


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

const updateStatusOrders = async (token, orderNumber, orderStatus, provider) => {
  try {
    const response = await axios.put('https://qa-helpharma-p2h-apigateway-back.azurewebsites.net/distribution/updateStatusOrders', {
      NumeroPedido: orderNumber,
      EstadoPedido: orderStatus,
      Prestador: provider
    }, {
      headers: {
        usuario: 'pruebaenvio',
        token: token
      }
    });

    const result = response.data;
    console.log("Result: ", result);
    return result;
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
    status = status === "completed" ? 1 : 0;

    const token = await authenticate();

    const statusUp = updateStatusOrders(token, id, status, 2);
    console.log("Token", token);

    

  return res.status(200).send({ message: 'Datos recibidos exitosamente', statusUp });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
