const { stateJSONData } = require('../model/stateJSONData');

const verifyStates = (req, res, next) => {
    
    const isState = stateJSONData.map(st => st.code).find(code => code === req.params.state.toUpperCase());

    if (!isState) 
    {
        return res.status(404).json({"message": "Invalid state abbreviation parameter"});
    }

    req.params.state = req.params.state.toUpperCase();
    next();
}

module.exports = verifyStates;