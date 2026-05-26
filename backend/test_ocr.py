import sys
import traceback

print("Starting test...")
try:
    print("Importing easyocr...")
    import easyocr
    print("easyocr imported successfully!")
    
    print("Initializing Reader with verbose=False...")
    reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    print("Reader initialized successfully!")
except Exception as e:
    print("An exception occurred:")
    traceback.print_exc()
    sys.exit(1)
