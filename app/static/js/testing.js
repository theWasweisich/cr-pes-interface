// Always include all words from the current document.
"javascript.suggest.alwaysAllWords"

// Complete functions with their parameter signature.
"javascript.suggest.completeFunctionCalls"

function test_display_all_crepes(crepes_list) {
    crepes_list.forEach(crepe => {
        console.table([[crepe.name, crepe.price, crepe.amount]]);
        console.log("-----------------------------");
    });
}