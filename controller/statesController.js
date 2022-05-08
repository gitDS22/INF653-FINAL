const State = require('../model/State');
const { stateJSONData } = require('../model/stateJSONData');

const getAllStates = async (req,res) => {
    //return contiguous states
    if(req.query.contig === 'true') {
        return res.status(200).json(stateJSONData.filter(st => st.code !== 'AK' && st.code !== 'HI'));
    }
    //return non-contiguous states
    if(req.query.contig === 'false') {
        return res.status(200).json(stateJSONData.filter(st => st.code === 'AK' || st.code === 'HI'));
    }
    
    //create an array to hold all of the states
    const statesArray = stateJSONData;

    //loop through the array and attach the fun facts if they are in the mongoDB
    for(let i = 0; i < statesArray.length; i++) {
        const stateData = statesArray[i];
        const stateExistsinMongo = await State.findOne({stateCode: stateData.code.toUpperCase()});
        if(stateExistsinMongo) {
            statesArray[i].funfacts = stateExistsinMongo.funfacts
        }
    }

    //return all of the states with the fun facts
    res.status(200).json(statesArray);
}


const getState = async (req,res) => {

    //grab the state data using the URL parameter defined for the state
    const stateData = stateJSONData.find(st => st.code === req.params.state);

    //check if we can find this state in the mongoDB
    const stateExistsinMongo = await State.findOne({stateCode: req.params.state });

    //if the state exists in the mongoDB, attach the fun facts
    if(stateExistsinMongo) {
        let funFactsArray = stateExistsinMongo.funfacts;
        if (funFactsArray.length !== 0) {
            stateData.funfacts = [...funFactsArray]; 
        }
    }
    //return the state data with the fun facts
    res.status(200).json(stateData);
}

const getCapital = (req,res) => {
    //grab the state data using the URL parameter defined for the state
    const stateData = stateJSONData.find(st => st.code === req.params.state);

    //return the capital of the given state
    res.status(200).json({state:stateData.state, capital: stateData.capital_city});
}

const getNickname = (req,res) => {
    //grab the state data using the URL parameter defined for the state
    const stateData = stateJSONData.find(st => st.code === req.params.state);

    //return the nickname of the given state
    res.status(200).json({state:stateData.state, nickname: stateData.nickname});
}

const getPopulation = (req,res) => {
    //grab the state data using the URL parameter defined for the state
    const stateData = stateJSONData.find(st => st.code === req.params.state);

    //convert the population number to the proper string format with commas
    const population = stateData.population.toLocaleString("en-US");

    //return the population data of the given state
    res.status(200).json({state:stateData.state, population });
}

const getAdmissionDate = (req,res) => {
    //grab the state data using the URL parameter defined for the state
    const stateData = stateJSONData.find(st => st.code === req.params.state);

    //return the admission date of the given state
    res.status(200).json({state:stateData.state, admitted: stateData.admission_date });
}

const getFunFact = async (req,res) => {
    //grab the state data using the URL parameter defined for the state
    const stateData = await stateJSONData.find(st => st.code === req.params.state);

    //check if the given state exists in the mongoDB holding the fun facts
    //const stateExistsinMongo = await State.findOne({stateCode: req.params.state });
    const stateExistsinMongo = await State.findOne({stateCode: stateData.code });

    //if the state does not exist, then return the below message
    if(!stateExistsinMongo) {
        return res.status(404).json({ "message": `No Fun Facts found for ${stateData.state}`});
    }
    ///if the state exists, then return a random fun fact from the fun facts array found in mongoDB
    else {
        let funFactsArray = stateExistsinMongo.funfacts;
        res.status(200).json({funfact: funFactsArray[Math.floor(Math.random()*funFactsArray.length)]});
    }
}

const createNewFunFact = async (req,res) => {
    //verify that there are fun facts entered in the body 
    if(!req.body.funfacts) {
        return res.status(400).json({"message": "State fun facts value required"});
    }
    //verify that the fun facts are in the array format
    if (!Array.isArray(req.body.funfacts)) {  
        return res.status(400).json({"message": "State fun facts value must be an array"});
    }

    //check if the given state exists in the mongoDB holding the fun facts
    const stateExistsinMongo = await State.findOne({stateCode: req.params.state});

    //if the state does not exist in the mongoDB, then add the state with the fun facts to mongoDB
    if (!stateExistsinMongo) {
            const newStateArray = await State.create({
                stateCode: req.params.state,
                funfacts: req.body.funfacts
            });
            res.status(201).json(newStateArray);
    }
    //if the state already exists in the mongoDB, then add more fun facts
    else {
        let funFactsArray = stateExistsinMongo.funfacts;
        funFactsArray = funFactsArray.push(...req.body.funfacts);
        const updatedArray = await stateExistsinMongo.save();
        res.status(201).json(updatedArray);
    }
}
const updateFunFact = async (req,res) => {
    //verify that there is an index in the body
    if(!req.body.index) {
        return res.status(400).json({"message": "State fun fact index value required"});
    }
    //verify that there is a fun fact string entered
    if(!req.body.funfact) {
        return res.status(400).json({"message": "State fun fact value required"});
    }
    //grab the state data using the URL parameter defined for the state
    const stateData = stateJSONData.find(st => st.code === req.params.state);

    //check if the given state exists in the mongoDB holding the fun facts
    const stateExistsinMongo = await State.findOne({stateCode: req.params.state});

    //if the state does not exist in the mongoDB, return message
    if(!stateExistsinMongo) {
        return res.status(404).json({"message": `No Fun Facts found for ${stateData.state}`});
    }

    //create an array to hold the fun facts from mongoDB for the given state
    let funFactsArray = stateExistsinMongo.funfacts;

    //If there are no fun facts at the given index starting at 1, return error message
    if(!funFactsArray[req.body.index - 1]) {
        return res.status(404).json({"message": `No Fun Fact found at that index for ${stateData.state}`});
    }

    //if there is a fun fact at the given index, then replace with the fun fact in the body and save
    stateExistsinMongo.funfacts[req.body.index - 1] = req.body.funfact;
    const updatedArray = await stateExistsinMongo.save();
    res.status(201).json(updatedArray);
}
const deleteFunFact = async (req,res) => {
    //verify that there is an index in the body
    if(!req.body.index) {
        return res.status(400).json({"message": "State fun fact index value required"});
    }

    //grab the state data using the URL parameter defined for the state
    const stateData = stateJSONData.find(st => st.code === req.params.state);

    //check if the given state exists in the mongoDB holding the fun facts
    const stateExistsinMongo = await State.findOne({stateCode: req.params.state});

    //if the state does not exist in mongoDB, then return error message
    if(!stateExistsinMongo) {
        return res.status(404).json({"message": `No Fun Facts found for ${stateData.state}`});
    }

    //create array to hold the fun facts from the mongoDB for the given state
    let funFactsArray = stateExistsinMongo.funfacts;

    //if there are no fun facts at the given index starting at 1, then return error message
    if(!funFactsArray[req.body.index - 1]) {
        return res.status(404).json({"message": `No Fun Fact found at that index for ${stateData.state}`});
    }

    //remove 1 item from the array at the given index starting at 1
    funFactsArray.splice(req.body.index-1, 1);

    //update the array in mongoDB
    const updatedArray = await stateExistsinMongo.save();
    res.status(201).json(updatedArray); 
}


module.exports = {
    getAllStates,
    getState,
    getCapital,
    getNickname,
    getPopulation,
    getAdmissionDate,
    getFunFact,
    createNewFunFact,
    updateFunFact,
    deleteFunFact
}

