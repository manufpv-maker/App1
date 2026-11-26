import json,re,sys,os
raw=json.load(open(sys.argv[1]));out=sys.argv[2];os.makedirs(out,exist_ok=True)
A={'к':'k','н':'n','г':'g','п':'p','с':'s','м':'m','юс':'ys','гх':'gh'}
idx=[];per={c:{} for c in A};notitle=[]
for code,t in raw.items():
    m=re.match(r'^(юс|гх|к|н|г|п|с|м)(\d+)$',code);c,n=m.group(1),int(m.group(2))
    t=t.replace('\r','').strip('\n')
    t=re.sub(r'\n{3,}','\n\n',t)
    t='\n'.join(l.rstrip() for l in t.split('\n'))
    t=re.sub(r'^\s*Мы по[её]м Господу\s*\d+\s*\n+','',t)
    per_t=t
    lines=[l for l in t.split('\n') if l.strip()]
    title='';rest=lines
    if lines and re.match(r'^\s*[А-ЯЁа-яё]{1,2}\s*\d+\s*\.?',lines[0]):
        title=re.sub(r'^\s*[А-ЯЁа-яё]{1,2}\s*\d+\s*\.?\s*','',lines[0]).strip(' .');rest=lines[1:]
    first=''
    for l in rest:
        s=re.sub(r'^\s*(\d+\s*[.)]|пр(ипев)?\s*[.:]*)\s*','',l,flags=re.I).strip()
        if s: first=s;break
    if not title: title=first;notitle.append(code)
    sub=''
    m2=re.match(r'^(.*?)\s*\(([^()]*\d[^()]*)\)\s*$',title)
    if m2 and m2.group(1): title,sub=m2.group(1),m2.group(2)
    idx.append([c,n,title,first]+([sub] if sub else []));per[c][n]=t
order=list(A)
idx.sort(key=lambda r:(order.index(r[0]),r[1]))
json.dump(idx,open(f'{out}/index.json','w'),ensure_ascii=False,separators=(',',':'))
for c,d in per.items(): json.dump({k:d[k] for k in sorted(d)},open(f'{out}/{A[c]}.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(idx),'no title:',len(notitle),notitle[:10])
