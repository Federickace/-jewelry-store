const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.post('/', productController.insertProduct);
router.post('/getProductByBarcode', productController.getProductByBarcode);
router.delete('/deleteProductByBarcode', productController.deleteProductByBarcode);
router.put('/updatePrice', productController.updatePriceByBarcode);
router.delete('/deleteSingleProduct', productController.deleteSingleProduct);
router.put('/updatePriceById', productController.updatePriceById);
router.put('/updatePriceByGroup', productController.updatePriceByGroup);

module.exports = router;
