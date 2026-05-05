#Build application
FROM python:3.11-slim
WORKDIR /app

#install backend dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#copy source code
COPY . .

#environment variables
ENV PYTHONUNBUFFERED=1

#expose port
EXPOSE 8000

#start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
