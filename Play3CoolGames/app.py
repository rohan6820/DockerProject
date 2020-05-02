from flask import Flask, render_template
app = Flask(__name__)
@app.route('/')
def home():
    return render_template("home.html")
@app.route("/play")
def play():
     return render_template("play.html")
@app.route("/snake")
def snake():
     return render_template("snake.html")
@app.route("/astroids")
def astroids():
     return render_template("astroids.html")
if __name__ == "__main__":
    app.run()
