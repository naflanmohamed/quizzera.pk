const http = require('http');

http.get('http://localhost:5000/api/exams', (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    try {
        const json = JSON.parse(data);
        console.log("Status Code:", resp.statusCode);
        console.log("Success:", json.success);
        console.log("Count:", json.count);
        if (json.data) {
            json.data.forEach(e => console.log(`ID: ${e.id || e._id} | Title: ${e.title}`));
        } else {
            console.log("No data field");
            console.log(json);
        }
    } catch (e) {
        console.log("Error parsing JSON:", e.message);
        console.log("Raw data:", data);
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
