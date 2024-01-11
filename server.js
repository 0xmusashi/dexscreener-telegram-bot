const express = require('express');
const app = express();
const port = 4000; // You can choose a different port if needed

app.get('/price', (req, res) => {
    console.log('User called GET');
    res.json({
        'data': '$LINK',
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
