#!/bin/bash

rm metadyn_view.zip
zip -r metadyn_view.zip public_html
chmod -R o+r public_html
chmod o+r metadyn_view.zip
