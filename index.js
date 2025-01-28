const {url} = require('./link')


const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': '279177b5b4msh2c043493d67d3a4p1634d9jsn81d450455ce7',
    'x-rapidapi-host': 'countries-states-and-cities.p.rapidapi.com'
  }
};

fetch(url)
  .then((response) => {
    return response.text()
  })
  .then((response)=> console.log(response))


