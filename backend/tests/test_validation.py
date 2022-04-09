from backend.app import validation


def test_flatten():
    posting = validation.IncomingCorrection(
        posting_id=0, correction=validation.Prediction(bike="", frame="", color="")
    )
    flattened_posting = validation.flatten(posting, nested="correction")
    expected = {"posting_id": 0, "bike": "", "frame": "", "color": ""}
    assert flattened_posting == expected
