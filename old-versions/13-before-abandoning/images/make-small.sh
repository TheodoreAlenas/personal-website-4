for f in top-faces-big/*; do ffmpeg -hide_banner -i "$f" -vf "scale=iw/8:ih/8" -q:v 2 "top-faces-small/${f#*/}"; done
