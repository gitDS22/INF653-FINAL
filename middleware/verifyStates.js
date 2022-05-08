const { stateJSONData } = require('../model/stateJSONData');

const verifyStates = (req, res, next) => {
    //map the JSON data to verify the state code pulled in from the URL
    const isState = stateJSONData.map(st => st.code).find(code => code === req.params.state.toUpperCase());

    //if the states does not exist, send error message
    if (!isState) 
    {
        return res.status(404).json({"message": "Invalid state abbreviation parameter"});
    }
    //always make sure the state code pulled in from the URL is uppercase
    req.params.state = req.params.state.toUpperCase();
    next();
}

module.exports = verifyStates;