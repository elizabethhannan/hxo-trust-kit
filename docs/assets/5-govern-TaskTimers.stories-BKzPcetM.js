/* empty css            */import{T as g,t as a,s as t}from"./scorecard-tqw-fREY.js";import"./jsx-runtime-CBDCb4rg.js";import"./index-B-o1Wr-g.js";import"./_commonjsHelpers-Cpj98o6Y.js";const s=a(t("Drifting",{codeMatcher:"v2.0"}),1/0,"Run 1"),l=a(t("Drifting",{codeMatcher:"v2.1"}),1/0,"Run 2"),f=a(t("Drifting",{codeMatcher:"v2.1"}),16*60,"Run 2"),k={title:"5–7 · Learn and govern/Task timers",component:g,parameters:{docs:{description:{component:"One timer per task (each agent's job) for a test run, compared with a finished earlier run on the same 24 synthetic claims. Here the earlier run used Code matcher v2.0 and this run uses the v2.1 candidate. Times are simulated seconds, so playback speed never changes them."}}}},e={name:"Compare=v2.0 then v2.1, State=Finished",args:{current:l,previous:s}},r={name:"Compare=v2.0 then v2.1, State=Running",args:{current:f,previous:s,live:!0}},n={name:"Compare=None, State=Finished",args:{current:s}};var o,i,c;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  name: "Compare=v2.0 then v2.1, State=Finished",
  args: {
    current: run2,
    previous: run1
  }
}`,...(c=(i=e.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};var m,u,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  name: "Compare=v2.0 then v2.1, State=Running",
  args: {
    current: midRun,
    previous: run1,
    live: true
  }
}`,...(p=(u=r.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var d,v,h;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: "Compare=None, State=Finished",
  args: {
    current: run1
  }
}`,...(h=(v=n.parameters)==null?void 0:v.docs)==null?void 0:h.source}}};const y=["Compared","Live","First"];export{e as Compared,n as First,r as Live,y as __namedExportsOrder,k as default};
