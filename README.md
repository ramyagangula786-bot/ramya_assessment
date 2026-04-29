About my project and API Key:-
The project is running successfully without any errors after setup.
The server starts properly at http://localhost:3000.
The /extract API is working as expected and is returning structured JSON output.
The Gemini AI is correctly extracting important details like vendor name, amount, date, and invoice ID from the input text.
Confidence scores are being generated properly for each extracted field.
If any field has low confidence, it is correctly marked as needs_review.
The review_required flag is also working properly when any information is uncertain.
How to Run:-
npm install
npm start
then you will get an URL with Port.
http://localhost:3000
then you will see the sucessfull data extraction here.
