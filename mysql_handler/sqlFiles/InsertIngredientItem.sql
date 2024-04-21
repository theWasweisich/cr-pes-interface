INSERT INTO ingredientitem (
	ingredientID, 
    crêpeID, 
    amountUsed, 
    amountUnit
    ) VALUES 
    (4, 10, 2, "Scheiben"),
    (5, 10, 2, "Scheiben");

SELECT id, 
		ingredientID, 
		crêpeID, 
        amountUsed, 
        amountUnit
        FROM ingredientitem;