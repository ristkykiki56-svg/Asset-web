#!/usr/bin/env python3
"""Non-generative extract of red match air rifle from provided Twin Shooter poster."""
import argparse
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageFilter

parser=argparse.ArgumentParser()
parser.add_argument('--poster',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
src=Image.open(args.poster).convert('RGB')
if src.size!=(1065,1536):
    raise SystemExit(f'Unexpected poster dimensions {src.size}')
x0,y0,x1,y1=463,1320,1064,1520
crop=np.asarray(src)[y0:y1,x0:x1]
gray=cv2.cvtColor(crop,cv2.COLOR_RGB2GRAY)
_,labels,stats,_=cv2.connectedComponentsWithStats((gray<225).astype('uint8'),connectivity=8)
if len(stats)<2:
    raise SystemExit('Original rifle silhouette missing')
index=1+int(np.argmax(stats[1:,cv2.CC_STAT_AREA]))
area=int(stats[index,cv2.CC_STAT_AREA])
if area<25000:
    raise SystemExit(f'Unexpected rifle silhouette size {area}')
mask=np.uint8(labels==index)
mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((3,3),dtype='uint8'))
mask=cv2.dilate(mask,np.ones((3,3),dtype='uint8'))
alpha=np.uint8(np.clip(np.rint(cv2.GaussianBlur(mask.astype('float32'),(3,3),0.7)*255),0,255))
raster=Image.fromarray(np.dstack([crop,alpha]),'RGBA')
left,top,right,bottom=raster.getchannel('A').getbbox()
pad=6
raster=raster.crop((max(0,left-pad),max(0,top-pad),min(raster.width,right+pad),min(raster.height,bottom+pad)))
width=1550
raster=raster.resize((width,round(raster.height*width/raster.width)),Image.Resampling.LANCZOS)
raster=raster.filter(ImageFilter.UnsharpMask(radius=1,percent=80,threshold=3))
args.output.parent.mkdir(parents=True,exist_ok=True)
raster.save(args.output,'WEBP',quality=86,method=6,exact=True)
verify=Image.open(args.output)
if verify.mode!='RGBA' or verify.size!=(1550,521):
    raise SystemExit(f'Unexpected generated WebP properties: {verify.mode} {verify.size}')
print(f'Poster-derived red rifle: {verify.size}, {args.output.stat().st_size} bytes')
