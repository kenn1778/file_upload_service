- Design  a file upload system App.
Use a Server and a Data base
- A user passes a file and ID to my DataBase so i can validate it. then we extract some metadata about their file and store. it all in our database.
- The file themselves in a relational database like postgress is the right approach.
we store information about the file in postgress so we can easily query through things like how many files does the user have and what are the namnes of these files.
- westore the files in S3 which is more better to store large files 
- the entire file is going to be passing through my API,s and servers on every request.
- using S3directly we first of all generate a pre signed upload URL in s3 and we will give that back to the users and they upload a file directly to the URL so our file never actually goes through our servers.
- For Downalod:
    we will work on downlaods on the same we worked for the upload.
- to get a file we will first look in the postgress table check the metadata. then we will get the ID for where that file is stored in S3 we will generate a presigned URL.
- the the URL will be returned to the user and the downlaod directly from S3. so the file never passes through a server.

- Use Reactnative and smooth animation for the mobile using
 app reanimated and other cool animation dependencies 