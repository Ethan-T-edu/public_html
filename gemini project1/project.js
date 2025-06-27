function colorFunction() {
    const text1 = document.getElementById("text1");
    text1.innerHTML = "First Test";
    const input = document.getElementById("input")
    document.body.style.backgroundColor = input.value;
    text1.innerHTML = input.value;
}
function textFunction() {
    const text2 = document.getElementById("text2");
    text2.innerHTML = "Second Test";
    const input2 = document.getElementById("input2")
    const paragraphs = document.getElementsByClassName("class1");

    // Loop through all elements with the class "class1" or the paragraphs and set their background color.
    for (const paragraph of paragraphs) {
        paragraph.style.backgroundColor = input2.value;
    }
    /*Output the result/name of color inputted only once for "effieciency"*/
    text2.innerHTML = input2.value;
}