const predictClassification = require('../services/inferenceService');
const storeData = require('../services/storeData');
const getHistories = require('../services/getHistories');
const crypto = require('crypto');
const { InputError } = require('../exceptions/InputError');

async function postPredictHandler(req, res, next) {
  try {
    const image = req.file;
    if (!image) {
      throw new InputError('Image is required');
    }

    const { model } = req.app.locals;
    const { confidenceScore, label, suggestion } = await predictClassification(model, image.buffer);

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    const data = {
      id,
      result: label,
      suggestion,
      confidenceScore,
      createdAt
    };

    await storeData(id, data);

    res.status(201).json({
      status: 'success',
      message: 'Model is predicted successfully',
      data
    });
  } catch (error) {
    next(error);
  }
}

async function getHistoriesHandler(req, res, next) {
  try {
    const histories = await getHistories();
    res.status(200).json({
      status: 'success',
      data: histories
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { postPredictHandler, getHistoriesHandler };
