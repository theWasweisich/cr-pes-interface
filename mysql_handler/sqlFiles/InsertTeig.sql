SET @to_do = 15;

SELECT * FROM ingredientitem where crêpeID = @to_do;

INSERT INTO ingredientitem (
	ingredientID, crêpeID, amountUsed, amountUnit
	) VALUES 
    (3, @to_do, 1, "Batzen");