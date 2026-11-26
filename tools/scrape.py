import urllib.parse,urllib.request,urllib.error,re,json,html,sys,time
from concurrent.futures import ThreadPoolExecutor
OUT=sys.argv[1]
B="https://functions.yandexcloud.net/d4e02omtu989a7khj11n?psal="
def get(code):
    for a in range(5):
        try:
            h=urllib.request.urlopen(B+urllib.parse.quote(code),timeout=40).read().decode()
            m=re.search(r'<div class="text">(.*?)</div>',h,re.S)
            return html.unescape(m.group(1)) if m else None
        except urllib.error.HTTPError as e:
            if e.code==404: return None
            time.sleep(2*(a+1))
        except Exception: time.sleep(2*(a+1))
    return "ERR"
known={'п':1005,'к':89,'н':217,'г':571,'с':525,'м':200,'юс':850,'гх':393}
res={}
with ThreadPoolExecutor(12) as ex:
    for c,mx in known.items():
        codes=[f"{c}{n}" for n in range(1,mx+31)]
        for code,t in zip(codes,ex.map(get,codes)): res[code]=t
        print(c,sum(1 for k in codes if res[k] and res[k]!="ERR"),'errs',[k for k in codes if res[k]=="ERR"],'found beyond',[k for k in codes[mx:] if res[k]],flush=True)
json.dump({k:v for k,v in res.items() if v},open(OUT,'w'),ensure_ascii=False)
