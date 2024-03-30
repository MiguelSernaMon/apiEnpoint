const express = require('express');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const sendDataToApi = (data) => {
    app.post('/checkout', (req, res) => {

    })
}


app.post('/detailed-checkout', (req, res) => {
   if (!req.body) {
    return res.status(400).send({ error: 'No se recibió ningún dato' });
  }

  // Si se recibió el JSON correctamente
    console.log('Datos JSON recibidos:', req.body);

    let { pictures, status, id } = req.body[0]
    let {checkout_time,  created} = req.body[0]
    checkout_time = checkout_time.split(".")[0];
    created = created.split(".")[0];
    console.log("Checkout time: ", checkout_time);
    console.log("Checkout Created: ", created);
    pictures = pictures[0];
    console.log('Pictures:', pictures);
    console.log('Status: ', status);
    console.log('Id ', id);

    

  return res.status(200).send({ message: 'Datos recibidos exitosamente' });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
