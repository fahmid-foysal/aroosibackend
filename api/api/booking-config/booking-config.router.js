const { addPlan, addPurpose, addSource, addMethod, showConfig, addAgent, addCompany, addDisType, addRoomService, delConfig, updatePurpose, updatePlan, updateSource, updateAgent, updateCompany, updateMethod, updateDisType, updateRoomService } = require("./booking-config.controller");
const { checkToken, checkUser, authorize } = require("../../middleware/auth");
const router = require("express").Router();
const { param, body } = require("express-validator");

router.post("/create/purpose", 
  [
    body('purpose_name').notEmpty().withMessage("Purpose name is required")

  ],
  checkToken,

  addPurpose

);

router.put("/update/purpose", 
  [
    body('purpose_name').notEmpty().withMessage("Purpose name is required"),
    body('id').notEmpty().withMessage('Purpose id is required').isInt().withMessage('id is a integer field')

  ],
  checkToken,

  updatePurpose

);



router.post("/create/plan", 
  [
    body('plan_name').notEmpty().withMessage("Plan name is required")

  ],
  checkToken,

  addPlan

);


router.put("/update/plan", 
  [
    body('plan_name').notEmpty().withMessage("Plan name is required"),
    body('description').notEmpty().withMessage('Updated or old description is required'),
    body('id').notEmpty().withMessage('Plan id is required').isInt().withMessage('id is a integer field')    
  ],
  checkToken,

  updatePlan

);





router.post("/create/source", 
  [
    body('source_name').notEmpty().withMessage("Source name is required")

  ],
  checkToken,

  addSource

);


router.put("/update/source", 
  [
    body('source_name').notEmpty().withMessage("Source name is required"),
    body('id').notEmpty().withMessage('Source id is required').isInt().withMessage('id is a integer field')
  ],
  checkToken,

  updateSource

);






router.post("/create/agent", 
  [
    body('name').notEmpty().withMessage("Name is required"),
    body('phone').notEmpty().withMessage("phone is required"),
    body('address').notEmpty().withMessage("address is required"),
    body('commission').notEmpty().withMessage("commission is required")
    
  ],
  checkToken,

  addAgent

);


router.put("/update/agent", 
  [
    body('name').notEmpty().withMessage("Name is required"),
    body('phone').notEmpty().withMessage("phone is required"),
    body('address').notEmpty().withMessage("address is required"),
    body('commission').notEmpty().withMessage("commission is required"),
    body('id').notEmpty().withMessage('Agent id is required').isInt().withMessage('id is a integer field')    
  ],
  checkToken,

  updateAgent

);




router.post("/create/affiliates", 
  [
    body('company_name').notEmpty().withMessage("Name is required"),
    body('phone').notEmpty().withMessage("phone is required"),
    body('address').notEmpty().withMessage("address is required"),
    body('discount_rate').notEmpty().withMessage("commission is required"),
    
  ],
  checkToken,

  addCompany

);



router.put("/update/affiliates", 
  [
    body('company_name').notEmpty().withMessage("Name is required"),
    body('phone').notEmpty().withMessage("phone is required"),
    body('address').notEmpty().withMessage("address is required"),
    body('discount_rate').notEmpty().withMessage("commission is required"),
    body('id').notEmpty().withMessage('company id is required').isInt().withMessage('id is a integer field')    
    
  ],
  checkToken,

  updateCompany

);







router.post("/create/payment-method", 
  [
    body('method').notEmpty().withMessage("method name is required"),
    body('acc_no').notEmpty().withMessage("acc_no is required"),
    body('description').notEmpty().withMessage("description is required"),

  ],
  checkToken,

  addMethod

);



router.put("/update/payment-method", 
  [
    body('method').notEmpty().withMessage("method name is required"),
    body('acc_no').notEmpty().withMessage("acc_no is required"),
    body('description').notEmpty().withMessage("description is required"),
    body('id').notEmpty().withMessage('method id is required').isInt().withMessage('id is a integer field')    

  ],
  checkToken,

  updateMethod

);





router.post("/create/discount-type", 
  [
    body('type').notEmpty().withMessage("Type name is required"),
    body('amount').notEmpty().withMessage("amount is required"),
    body('description').notEmpty().withMessage("description is required"),

  ],
  checkToken,

  addDisType

);


router.put("/update/discount-type", 
  [
    body('type').notEmpty().withMessage("Type name is required"),
    body('amount').notEmpty().withMessage("amount is required"),
    body('description').notEmpty().withMessage("description is required"),
    body('id').notEmpty().withMessage('Discount type id is required').isInt().withMessage('id is a integer field')    
  ],
  checkToken,

  updateDisType

);





router.post("/create/room-service", 
  [
    body('service_name').notEmpty().withMessage("Service name is required"),
    body('unit').notEmpty().withMessage("unit is required"),
    // body('description').notEmpty().withMessage("description is required"),
    body('price').notEmpty().withMessage("price is required"),
  ],
  checkToken,

  addRoomService

);



router.put("/update/room-service", 
  [
    body('service_name').notEmpty().withMessage("Service name is required"),
    body('unit').notEmpty().withMessage("unit is required"),
    body('description').notEmpty().withMessage("description is required"),
    body('price').notEmpty().withMessage("price is required"),
    body('id').notEmpty().withMessage('service id is required').isInt().withMessage('id is a integer field')    

  ],
  checkToken,

  updateRoomService

);





router.get("/:item",
    [
       param('item')
    .notEmpty().withMessage("Method name is required")
    .isIn(['purpose', 'plan', 'source', 'paymentmethod', 'agent', 'affiliates', 'discounttypes', 'roomservice'])
    .withMessage("Item must be one of: purpose, plan, source, paymentmethod")

    ],
    
    checkToken, showConfig);


router.get("/config/:item",
    [
       param('item')
    .notEmpty().withMessage("Method name is required")
    .isIn(['purpose', 'plan', 'source', 'paymentmethod', 'agent', 'affiliates', 'discounttypes', 'roomservice'])
    .withMessage("Item must be one of: purpose, plan, source, paymentmethod")

    ],
    
    checkUser, authorize("front_office", "view"), showConfig);
    
    
    router.delete("/delete/:item/:id",
    [
       param('item')
    .notEmpty().withMessage("Method name is required")
    .isIn(['purpose', 'plan', 'source', 'paymentmethod', 'agent', 'affiliates', 'rooms', 'categories', 'room_services', 'discounttypes', 'branch'])
    .withMessage("Item must be one of: purpose, plan, source, paymentmethod"),
    param('id').notEmpty().withMessage("Item id is required").isInt().withMessage("Id must be integer")

    ],
    
    checkToken, delConfig);

    router.delete("/user/delete/:item/:id",
    [
       param('item')
    .notEmpty().withMessage("Method name is required")
    .isIn(['bookings'])
    .withMessage("Item must be one of: purpose, plan, source, paymentmethod"),
    param('id').notEmpty().withMessage("Item id is required").isInt().withMessage("Id must be integer")

    ],
    
    checkUser, authorize("front_office", "del"), delConfig);    



module.exports = router;
