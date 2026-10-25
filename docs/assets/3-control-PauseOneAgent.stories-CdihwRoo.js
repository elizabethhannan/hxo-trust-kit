import{j as r}from"./jsx-runtime-CBDCb4rg.js";/* empty css            */import{c as S,R as y}from"./scorecard-Cu0h3ONE.js";import"./index-B-o1Wr-g.js";import"./_commonjsHelpers-Cpj98o6Y.js";const T={title:"3 · Humans hold the switch/Pause one agent",component:S,parameters:{docs:{description:{component:"Figma: Control/Pause one agent. The last story shows the pause inside a test run of the agent team, followed by the Run scorecard that audits it. For a live run you can pause yourself, see Patterns › Agent team test run."}}}},a={name:"State=Running",args:{state:"Running"}},s={name:"State=Paused",args:{state:"Paused"}},t={name:"State=Resumed",args:{state:"Resumed"}},e={name:"In a test run: paused, then scored",args:{state:"Paused",pausedBy:"K. Patel",at:"09:24"},render:x=>r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:24},children:[r.jsx(S,{...x}),r.jsx(y,{run:"Paused mid-run",view:"Card"})]})};var n,o,u;a.parameters={...a.parameters,docs:{...(n=a.parameters)==null?void 0:n.docs,source:{originalSource:`{
  name: "State=Running",
  args: {
    "state": "Running"
  }
}`,...(u=(o=a.parameters)==null?void 0:o.docs)==null?void 0:u.source}}};var d,m,c;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: "State=Paused",
  args: {
    "state": "Paused"
  }
}`,...(c=(m=s.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};var i,p,g;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  name: "State=Resumed",
  args: {
    "state": "Resumed"
  }
}`,...(g=(p=t.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var l,h,R,P,f;e.parameters={...e.parameters,docs:{...(l=e.parameters)==null?void 0:l.docs,source:{originalSource:`{
  name: "In a test run: paused, then scored",
  args: {
    state: "Paused",
    pausedBy: "K. Patel",
    at: "09:24"
  },
  render: args => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  }}>
      <PauseOneAgent {...args} />
      <RunScorecard run="Paused mid-run" view="Card" />
    </div>
}`,...(R=(h=e.parameters)==null?void 0:h.docs)==null?void 0:R.source},description:{story:"The same pause inside a test run of the agent team, then the human-in-the-loop audit review of that run.",...(f=(P=e.parameters)==null?void 0:P.docs)==null?void 0:f.description}}};const C=["Running","Paused","Resumed","InATestRun"];export{e as InATestRun,s as Paused,t as Resumed,a as Running,C as __namedExportsOrder,T as default};
