# ReduceIt by Dataholics

Make your commutes eco-friendly with ReduceIt, 
the app that tracks your carbon footprint and suggests low-emission routes. 
Join the movement towards sustainable transportation and reduce your carbon emissions, 
one trip at a time!


## To run the app 
Install the packages:  
`pip install -r requirements.txt`

To start the API:   
`uvicorn app.main:app --reload`

Or build the docker image and run it:   
`docker build -t reduceit . && docker run -p 8000:8000 reduceit`

