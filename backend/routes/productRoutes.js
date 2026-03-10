const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.post('/', productController.insertProduct);
router.post('/getProductByBarcode', productController.getProductByBarcode);
router.delete('/deleteProductByBarcode', productController.deleteProductByBarcode);
router.put('/updatePrice', productController.updatePriceByBarcode);

module.exports = router;
