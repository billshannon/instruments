var mongoose = require('mongoose');
var instrumentSchema = new mongoose.Schema({
        make: String,
        model: String,
        year: Number,
        price: Number
    }
);

mongoose.model('Instrument', instrumentSchema);