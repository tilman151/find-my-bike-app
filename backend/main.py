import os

import uvicorn

if __name__ == "__main__":
    if "PORT" in os.environ:
        port = int(os.environ["PORT"])
        reload = False
    else:
        port = 8000
        reload = True
    uvicorn.run("backend.app.api:app", host="0.0.0.0", port=port, reload=reload)
