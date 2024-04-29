use crepesdb;
SELECT * FROM crêpes WHERE NOT EXISTS (
	SELECT 1 FROM ingredientitem WHERE `crêpeID`=crêpes.id
);