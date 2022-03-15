import{_ as n,c as s,o as a,a as p}from"./app.148e1184.js";var t="/vue-design/04/reactivity.png",o="/vue-design/04/effect-stack.png";const w='{"title":"\u54CD\u5E94\u7CFB\u7EDF\u7684\u4F5C\u7528\u4E0E\u5B9E\u73B0","description":"","frontmatter":{},"headers":[{"level":2,"title":"\u54CD\u5E94\u5F0F\u6570\u636E\u4E0E\u526F\u4F5C\u7528\u51FD\u6570","slug":"\u54CD\u5E94\u5F0F\u6570\u636E\u4E0E\u526F\u4F5C\u7528\u51FD\u6570"},{"level":2,"title":"\u54CD\u5E94\u5F0F\u6570\u636E\u7684\u57FA\u672C\u5B9E\u73B0","slug":"\u54CD\u5E94\u5F0F\u6570\u636E\u7684\u57FA\u672C\u5B9E\u73B0"},{"level":2,"title":"\u8BBE\u8BA1\u4E00\u4E2A\u5B8C\u5584\u7684\u54CD\u5E94\u7CFB\u7EDF","slug":"\u8BBE\u8BA1\u4E00\u4E2A\u5B8C\u5584\u7684\u54CD\u5E94\u7CFB\u7EDF"},{"level":2,"title":"\u5206\u652F\u5207\u6362\u4E0E cleanup","slug":"\u5206\u652F\u5207\u6362\u4E0E-cleanup"},{"level":3,"title":"\u5206\u652F\u5207\u6362","slug":"\u5206\u652F\u5207\u6362"},{"level":3,"title":"\u5EFA\u7ACB\u5173\u8054","slug":"\u5EFA\u7ACB\u5173\u8054"},{"level":3,"title":"cleanup","slug":"cleanup"},{"level":2,"title":"\u5D4C\u5957\u7684 effect \u4E0E effect \u6808","slug":"\u5D4C\u5957\u7684-effect-\u4E0E-effect-\u6808"},{"level":2,"title":"\u907F\u514D\u65E0\u9650\u9012\u5F52\u5FAA\u73AF","slug":"\u907F\u514D\u65E0\u9650\u9012\u5F52\u5FAA\u73AF"},{"level":2,"title":"\u8C03\u5EA6\u6267\u884C","slug":"\u8C03\u5EA6\u6267\u884C"},{"level":2,"title":"\u8BA1\u7B97\u5C5E\u6027 computed \u4E0E lazy","slug":"\u8BA1\u7B97\u5C5E\u6027-computed-\u4E0E-lazy"},{"level":2,"title":"watch","slug":"watch"},{"level":3,"title":"watch\u7684\u5B9E\u73B0\u539F\u7406","slug":"watch\u7684\u5B9E\u73B0\u539F\u7406"},{"level":3,"title":"\u7ACB\u5373\u6267\u884C\u7684 watch \u4E0E\u56DE\u8C03\u6267\u884C\u65F6\u673A","slug":"\u7ACB\u5373\u6267\u884C\u7684-watch-\u4E0E\u56DE\u8C03\u6267\u884C\u65F6\u673A"},{"level":3,"title":"\u8FC7\u671F\u7684\u526F\u4F5C\u7528","slug":"\u8FC7\u671F\u7684\u526F\u4F5C\u7528"}],"relativePath":"guide/reactivity/function-and-realization.md"}',e={},c=p(`<h1 id="\u54CD\u5E94\u7CFB\u7EDF\u7684\u4F5C\u7528\u4E0E\u5B9E\u73B0" tabindex="-1">\u54CD\u5E94\u7CFB\u7EDF\u7684\u4F5C\u7528\u4E0E\u5B9E\u73B0 <a class="header-anchor" href="#\u54CD\u5E94\u7CFB\u7EDF\u7684\u4F5C\u7528\u4E0E\u5B9E\u73B0" aria-hidden="true">#</a></h1><p>\u54CD\u5E94\u5F0F\u662F Vue.js \u7684\u91CD\u8981\u7EC4\u6210\u90E8\u5206</p><h2 id="\u54CD\u5E94\u5F0F\u6570\u636E\u4E0E\u526F\u4F5C\u7528\u51FD\u6570" tabindex="-1">\u54CD\u5E94\u5F0F\u6570\u636E\u4E0E\u526F\u4F5C\u7528\u51FD\u6570 <a class="header-anchor" href="#\u54CD\u5E94\u5F0F\u6570\u636E\u4E0E\u526F\u4F5C\u7528\u51FD\u6570" aria-hidden="true">#</a></h2><p>\u526F\u4F5C\u7528\u5C31\u662F\u4F1A\u4EA7\u751F\u526F\u4F5C\u7528\u7684\u51FD\u6570\uFF08\u5C31\u662F\u4E00\u4E2A\u51FD\u6570\u7684\u6267\u884C\u4F1A\u5BF9\u5916\u90E8\u4EA7\u751F\u5F71\u54CD\uFF09\uFF0C\u5982\u4E0B\u9762\u4EE3\u7801\u6240\u793A</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    document<span class="token punctuation">.</span>body<span class="token punctuation">.</span>innerText <span class="token operator">=</span> <span class="token string">&#39;hello vue3&#39;</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u526F\u4F5C\u7528\u5F88\u5BB9\u6613\u4EA7\u751F\uFF0C\u4F8B\u5982\u4E00\u4E2A\u51FD\u6570\u4FEE\u6539\u4E86\u5168\u5C40\u53D8\u91CF\u7B49</p><p>\u4E0B\u9762\u518D\u6765\u8BF4\u4E0B\u4EC0\u4E48\u662F\u54CD\u5E94\u5F0F\u6570\u636E</p><div class="language-js"><pre><code><span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token literal-property property">text</span><span class="token operator">:</span> <span class="token string">&#39;hello world&#39;</span> <span class="token punctuation">}</span>
<span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    document<span class="token punctuation">.</span>body<span class="token punctuation">.</span>innerText <span class="token operator">=</span> obj<span class="token punctuation">.</span>text
<span class="token punctuation">}</span>
</code></pre></div><p>\u4F8B\u5982\u6211\u4FEE\u6539 obj.text \u503C\uFF0C\u6211\u4EEC\u5E0C\u671B effect \u51FD\u6570\u91CD\u65B0\u6267\u884C\u3002\u5982\u679C\u5B9E\u73B0\u4E86\u8FD9\u4E2A\u6548\u679C\uFF0C\u90A3\u4E48 obj \u5C31\u662F\u4E00\u4E2A\u54CD\u5E94\u5F0F\u6570\u636E</p><div class="language-js"><pre><code>obj<span class="token punctuation">.</span>text <span class="token operator">=</span> <span class="token string">&#39;hello vue3&#39;</span>
</code></pre></div><p>\u5F88\u660E\u663E\uFF0C\u4E0A\u9762\u7684\u4EE3\u7801\u505A\u4E0D\u5230\u8FD9\u4E00\u70B9\uFF0C\u56E0\u4E3A obj \u662F\u4E00\u4E2A\u666E\u901A\u5BF9\u8C61\uFF0C\u4FEE\u6539\u503C\u65F6\u4E0D\u4F1A\u6709\u5176\u4ED6\u53CD\u5E94</p><h2 id="\u54CD\u5E94\u5F0F\u6570\u636E\u7684\u57FA\u672C\u5B9E\u73B0" tabindex="-1">\u54CD\u5E94\u5F0F\u6570\u636E\u7684\u57FA\u672C\u5B9E\u73B0 <a class="header-anchor" href="#\u54CD\u5E94\u5F0F\u6570\u636E\u7684\u57FA\u672C\u5B9E\u73B0" aria-hidden="true">#</a></h2><p>\u600E\u4E48\u624D\u80FD\u4F7F\u4E0A\u9762\u7684 obj \u53D8\u6210\u54CD\u5E94\u5F0F\u6570\u636E\u5462\uFF1F\u6211\u4EEC\u80FD\u53D1\u73B0\u4E24\u4E2A\u7EBF\u7D22</p><ul><li>\u5F53\u526F\u4F5C\u7528\u51FD\u6570\u6267\u884C\u65F6\uFF0C\u4F1A\u89E6\u53D1\u5B57\u6BB5 obj.text \u7684\u8BFB\u53D6\u64CD\u4F5C</li><li>\u5F53\u4FEE\u6539 obj.text \u7684\u503C\u65F6\uFF0C\u4F1A\u89E6\u53D1 obj.text \u7684\u8BBE\u7F6E\u64CD\u4F5C</li></ul><p>\u90A3\u4E48\u5982\u679C\u6211\u4EEC\u6211\u5728\u8BFB\u53D6\u548C\u8BBE\u7F6E\u7684\u65F6\u5019\u8FDB\u884C\u62E6\u622A\u4E0D\u5C31\u53EF\u4EE5\u4E86\u5417</p><p>\u63A5\u4E0B\u6765\u6211\u4EEC\u5C31\u4F7F\u7528 <a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy" target="_blank" rel="noopener noreferrer">Proxy</a> \u6765\u5B9E\u73B0\u5BF9 obj \u5C5E\u6027\u7684\u62E6\u622A\u3002\u5177\u4F53\u4EE3\u7801\u5982\u4E0B\uFF1A</p><div class="language-js"><pre><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">text</span><span class="token operator">:</span> <span class="token string">&#39;hello world&#39;</span>
<span class="token punctuation">}</span>
<span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    document<span class="token punctuation">.</span>body<span class="token punctuation">.</span>innerText <span class="token operator">=</span> obj<span class="token punctuation">.</span>text
<span class="token punctuation">}</span>

<span class="token keyword">const</span> bucket <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> <span class="token punctuation">{</span>
    <span class="token comment">// \u8BFB\u53D6\u64CD\u4F5C\u62E6\u622A</span>
    <span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        bucket<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>effect<span class="token punctuation">)</span>
        <span class="token keyword">return</span> target<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// \u8BBE\u7F6E\u64CD\u4F5C\u62E6\u622A</span>
    <span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">,</span> newVal<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        target<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> newVal
        bucket<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">fn</span> <span class="token operator">=&gt;</span> <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u4F7F\u7528\u4EE3\u7801\u6D4B\u8BD5\u4E0B</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    obj<span class="token punctuation">.</span>text <span class="token operator">=</span> <span class="token string">&#39;hello vue3&#39;</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5728\u6D4F\u89C8\u5668\u8FD0\u884C\uFF0C\u6211\u4EEC\u5C31\u4F1A\u770B\u5230 1 \u79D2\u540E\u6587\u5B57\u53D1\u751F\u4E86\u6539\u53D8\uFF0C\u8FBE\u5230\u4E86\u6211\u4EEC\u60F3\u8981\u7684\u6548\u679C</p><p>\u4F46\u6211\u4EEC\u4F1A\u53D1\u73B0\uFF0C\u6211\u4EEC\u7684\u62E6\u622A\u8BFB\u53D6\u64CD\u4F5C\u65F6\uFF0C\u76F4\u63A5\u628A\u526F\u4F5C\u7528\u51FD\u6570\u7ED9\u5199\u8FDB\u53BB\u4E86\uFF0C\u660E\u663E\u4E0D\u591F\u7075\u6D3B\u3002\u5982\u679C\u526F\u4F5C\u7528\u51FD\u6570\u80FD\u591F\u81EA\u52A8\u6DFB\u52A0\u8FDB\u5165\u5C31\u597D\u4E86\u3002\u6BD4\u5982\u6211\u4EEC\u4FEE\u6539\u51FD\u6570\u540D\u4E3A myEffect \u751A\u81F3\u662F\u533F\u540D\u51FD\u6570</p><h2 id="\u8BBE\u8BA1\u4E00\u4E2A\u5B8C\u5584\u7684\u54CD\u5E94\u7CFB\u7EDF" tabindex="-1">\u8BBE\u8BA1\u4E00\u4E2A\u5B8C\u5584\u7684\u54CD\u5E94\u7CFB\u7EDF <a class="header-anchor" href="#\u8BBE\u8BA1\u4E00\u4E2A\u5B8C\u5584\u7684\u54CD\u5E94\u7CFB\u7EDF" aria-hidden="true">#</a></h2><p>\u4E3A\u4E86\u89E3\u51B3\u4E0A\u9762\u7684\u95EE\u9898\uFF0C\u6211\u4EEC\u9996\u5148\u9700\u8981\u4E00\u4E2A\u7528\u6765\u6CE8\u518C\u526F\u4F5C\u7528\u51FD\u6570\u7684\u673A\u5236</p><div class="language-js"><pre><code><span class="token comment">// \u7528\u4E8E\u5B58\u50A8\u88AB\u6CE8\u518C\u7684\u5168\u5C40\u526F\u4F5C\u7528\u51FD\u6570</span>
<span class="token keyword">let</span> activeEffect

<span class="token comment">// \u7528\u4E8E\u6CE8\u518C\u526F\u4F5C\u7528\u51FD\u6570</span>
<span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    activeEffect <span class="token operator">=</span> fn
    <span class="token comment">// \u6267\u884C\u526F\u4F5C\u7528\u51FD\u6570</span>
    <span class="token function">activeEffect</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>effect \u51FD\u6570\u8C03\u7528\u65F6\uFF0C\u4F1A\u4F20\u9012\u4E00\u4E2A\u51FD\u6570\uFF0C\u8FD9\u4E2A\u51FD\u6570\u53EF\u4EE5\u4E3A\u4EFB\u610F\u51FD\u6570\u3002\u5F53\u8C03\u7528 effect \u51FD\u6570\u65F6\uFF0C\u8FD9\u4E2AactiveEffect \u503C\u5C31\u4F1A\u8D4B\u503CWie\u5F53\u524D\u7684 effect \u51FD\u6570\u4F20\u9012\u7684\u51FD\u6570\u5E76\u6267\u884C\u4F20\u9012\u7684\u51FD\u6570\u3002</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    document<span class="token punctuation">.</span>body<span class="token punctuation">.</span>innerText <span class="token operator">=</span> obj<span class="token punctuation">.</span>text
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5F53\u4F20\u9012\u7684\u8FD9\u4E2A\u51FD\u6570\u6267\u884C\u65F6\uFF0C\u5982\u679C\u8BFB\u53D6\u4E86 obj \u5BF9\u8C61\uFF0C\u90A3\u4E48\u5B83\u5C31\u4F1A\u89E6\u53D1 get \u62E6\u622A\uFF0C\u6211\u4EEC\u5728\u62E6\u622A\u8FC7\u7A0B\u4E2D\u5C06 activeEffect \u6DFB\u52A0\u5230 bucket \u961F\u5217\u4E2D\u5C31\u53EF\u4EE5\u4E86</p><div class="language-js"><pre><code><span class="token keyword">const</span> bucket <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> <span class="token punctuation">{</span>
    <span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            bucket<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> target<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">,</span> newVal<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        target<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> newVal
        bucket<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">fn</span> <span class="token operator">=&gt;</span> <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u7136\u540E\u6211\u4EEC\u518D\u5BF9\u4E0A\u9762\u4EE3\u7801\u8FDB\u884C\u6D4B\u8BD5\uFF0C\u5F53\u6211\u4EEC\u8BBF\u95EE\u4E00\u4E2A\u4E0D\u5B58\u5728\u7684\u5C5E\u6027\u65F6</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;effect run&#39;</span><span class="token punctuation">)</span>
    document<span class="token punctuation">.</span>body<span class="token punctuation">.</span>innerText <span class="token operator">=</span> obj<span class="token punctuation">.</span>text
<span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    obj<span class="token punctuation">.</span>notExist <span class="token operator">=</span> <span class="token string">&#39;hello vue3&#39;</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u8FD0\u884C\u4E0A\u9762\u4EE3\u7801\u65F6\uFF0C\u6211\u4EEC\u4F1A\u53D1\u73B0\u63A7\u5236\u53F0\u6253\u5370\u4E86\u4E24\u6B21 <code>effect run</code> \uFF0C\u800C\u6211\u4EEC obj.text \u7684\u503C\u5E76\u672A\u53D1\u751F\u4FEE\u6539\uFF0C\u800C\u6211\u4EEC\u662F\u5E0C\u671B\u4EC5\u5F53 text \u503C\u53D1\u751F\u6539\u53D8\u662F\uFF0C\u624D\u4F1A\u91CD\u65B0\u89E6\u53D1\u533F\u540D\u51FD\u6570\u7684\u6267\u884C\u3002\u5BFC\u81F4\u8BE5\u95EE\u9898\u7684\u539F\u56E0\u662F\u6CA1\u6709\u5728\u526F\u4F5C\u7528\u51FD\u6570\u548C\u88AB\u64CD\u4F5C\u7684\u5B57\u6BB5\u4E4B\u95F4\u5EFA\u7ACB\u660E\u786E\u7684\u8054\u7CFB\uFF0C\u89E3\u51B3\u65B9\u6CD5\u5F88\u7B80\u5355\uFF0C\u53EA\u9700\u8981\u5728\u526F\u4F5C\u7528\u51FD\u6570\u4E0E\u88AB\u64CD\u4F5C\u7684\u5B57\u6BB5\u5EFA\u7ACB\u8054\u7CFB\u5373\u53EF\u3002</p><p>\u6211\u4EEC\u518D\u6765\u770B\u4E0B\u9762\u4EE3\u7801</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token keyword">function</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    document<span class="token punctuation">.</span>body<span class="token punctuation">.</span>innerText <span class="token operator">=</span> obj<span class="token punctuation">.</span>text
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u4EE3\u7801\u4E2D\u5B58\u5728\u4E09\u4E2A\u89D2\u8272</p><ul><li>\u88AB\u64CD\u4F5C\u7684\u4EE3\u7406\u5BF9\u8C61 obj</li><li>\u88AB\u64CD\u4F5C\u7684\u5B57\u6BB5 text</li><li>\u4F7F\u7528 effect \u51FD\u6570\u6CE8\u518C\u7684\u526F\u4F5C\u7528\u51FD\u6570 effectFn</li></ul><p>\u5982\u679C\u7528 target \u6765\u8868\u793A\u4EE3\u7406\u5BF9\u8C61\u6240\u4EE3\u7406\u7684\u539F\u59CB\u503C\uFF0C\u7528 key \u5B57\u6BB5\u6765\u8868\u793A\u88AB\u64CD\u4F5C\u7684\u5B57\u6BB5\u540D\uFF0C\u7528 effectFn \u6765\u8868\u793A\u88AB\u6CE8\u518C\u7684\u526F\u4F5C\u7528\u51FD\u6570\uFF0C\u90A3\u4E48\u53EF\u4EE5\u4E3A\u8FD9\u4E09\u4E2A\u89D2\u8272\u5EFA\u7ACB\u5982\u4E0B\u5173\u7CFB</p><div class="language-"><pre><code>target
  \u2514\u2500\u2500 key
       \u2514\u2500\u2500 effectFn
</code></pre></div><p>\u6709\u4E24\u4E2A\u526F\u4F5C\u7528\u51FD\u6570\u8BFB\u53D6\u540C\u4E00\u4E2A\u5BF9\u8C61</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token keyword">function</span> <span class="token function">effectFn1</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    document<span class="token punctuation">.</span>body<span class="token punctuation">.</span>innerText <span class="token operator">=</span> obj<span class="token punctuation">.</span>text
<span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token function">effect</span><span class="token punctuation">(</span><span class="token keyword">function</span> <span class="token function">effectFn2</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>text<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u90A3\u4E48\u5BF9\u5E94\u5173\u7CFB\u5C31\u662F:</p><div class="language-"><pre><code>target
  \u2514\u2500\u2500 text
       \u251C\u2500\u2500 effectFn1
       \u2514\u2500\u2500 effectFn2
</code></pre></div><p>\u4E00\u4E2A\u526F\u4F5C\u7528\u51FD\u6570\u8BFB\u53D6\u4E86\u540C\u4E00\u5BF9\u8C61\u4E0A\u7684\u4E24\u4E2A\u5C5E\u6027</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token keyword">function</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>text1<span class="token punctuation">)</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>text2<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u90A3\u4E48\u5BF9\u5E94\u5173\u7CFB\u5C31\u662F:</p><div class="language-"><pre><code>target
  \u2514\u2500\u2500 text1
      \u2514\u2500\u2500  effectFn
  \u2514\u2500\u2500 text2
      \u2514\u2500\u2500  effectFn
</code></pre></div><p>\u5B9E\u73B0\u601D\u8DEF\u5982\u4E0B</p><ul><li>\u9996\u5148\u4F7F\u7528 bucket \u6765\u5B58\u50A8\u526F\u4F5C\u7528\u51FD\u6570\uFF0C bucket \u4F7F\u7528 WeakMap</li><li>\u5F53\u89E6\u53D1\u4EE3\u7406\u5BF9\u8C61\u7684 get \u65B9\u6CD5\u65F6\uFF0C\u6211\u4EEC\u53EF\u4EE5\u83B7\u53D6\u5230 target \u3001key <ul><li>\u5C06 target \u4F5C\u4E3A key \u5B58\u50A8\u5230 bucket \u4E0A, \u503C\u4E3A depsMap\uFF0C\u6570\u636E\u7ED3\u6784\u662F Map</li><li>\u5C06 key \u4F5C\u4E3A key \uFF0Cdeps \u4E3A\u503CdepsMap \u4E2D</li><li>\u5C06\u526F\u4F5C\u7528\u51FD\u6570\u6DFB\u52A0\u5230 deps \u4E2D</li></ul></li></ul><p><img src="`+t+`" alt=""></p><p>\u5B9E\u73B0\u4EE3\u7801\u5982\u4E0B\uFF1A</p><div class="language-js"><pre><code><span class="token keyword">const</span> bucket <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WeakMap</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> <span class="token punctuation">{</span>
    <span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">let</span> depsMap <span class="token operator">=</span> bucket<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                bucket<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> <span class="token punctuation">(</span>depsMap <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">let</span> deps <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>deps<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                depsMap<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> <span class="token punctuation">(</span>deps <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
            deps<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> target<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">,</span> newVal<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        target<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> newVal
        <span class="token keyword">const</span> depsMap <span class="token operator">=</span> bucket<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token keyword">return</span>
        <span class="token keyword">const</span> deps <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span>
        deps <span class="token operator">&amp;&amp;</span> deps<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">fn</span> <span class="token operator">=&gt;</span> <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u63A5\u4E0B\u6765\uFF0C\u518D\u5BF9\u4E0A\u9762\u4EE3\u7801\u8FDB\u884C\u5C01\u88C5\u3002\u6211\u4EEC\u628A\u62E6\u622A\u7684\u903B\u8F91\u90FD\u5199\u5728\u4E86 get \u548C set \u65B9\u6CD5\u4E2D\uFF0C\u4F46\u66F4\u597D\u7684\u505A\u6CD5\u662F\u5427\u8FD9\u90E8\u5206\u903B\u8F91\u5C01\u88C5\u5230\u4E00\u4E2A\u51FD\u6570\u4E2D\u3002</p><div class="language-js"><pre><code> <span class="token comment">// get \u62E6\u622A\u51FD\u6570\u5185\u8C03\u7528 track \u51FD\u6570\u89E6\u53D1\u8FFD\u8E2A\u53D8\u5316</span>
<span class="token keyword">function</span> <span class="token function">track</span><span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> key</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>activeEffect<span class="token punctuation">)</span> <span class="token keyword">return</span>
    <span class="token keyword">let</span> depsMap <span class="token operator">=</span> bucket<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        bucket<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> <span class="token punctuation">(</span>depsMap <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">let</span> deps <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>deps<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        depsMap<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> <span class="token punctuation">(</span>deps <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    deps<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// set \u62E6\u622A\u51FD\u6570\u5185\u8C03\u7528 trigger \u51FD\u6570\u89E6\u53D1\u53D8\u5316</span>
<span class="token keyword">function</span> <span class="token function">trigger</span><span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> key</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> depsMap <span class="token operator">=</span> bucket<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token keyword">return</span>
    <span class="token keyword">const</span> deps <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span>
    deps <span class="token operator">&amp;&amp;</span> deps<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">fn</span> <span class="token operator">=&gt;</span> <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> <span class="token punctuation">{</span>
    <span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">track</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">)</span>
        <span class="token keyword">return</span> target<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">,</span> newVal<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        target<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> newVal
        <span class="token function">trigger</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u8FD9\u6837\u6211\u4EEC\u5C31\u5C06\u8FFD\u8E2A\u53D8\u5316\u51FD\u6570\u5C01\u88C5\u5230 track \u4E2D\uFF0C\u89E6\u53D1\u903B\u8F91\u5C01\u88C5\u5230 trigger \u51FD\u6570\u4E2D</p><p>\u63A5\u4E0B\u6765\u8BF4\u4E0B\u4E3A\u4EC0\u4E48 bucket \u8981\u4F7F\u7528 <a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap" target="_blank" rel="noopener noreferrer">WeakMap</a> \uFF0C\u5148\u770B\u4E0B\u9762\u4EE3\u7801</p><div class="language-js"><pre><code><span class="token keyword">const</span> map <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token keyword">const</span> weakmap <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WeakMap</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token keyword">function</span> <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> foo <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;foo&#39;</span><span class="token punctuation">}</span>
    <span class="token keyword">const</span> bar <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;bar&#39;</span><span class="token punctuation">}</span>
    map<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>foo<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span>
    weakmap<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>bar<span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
<span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>map<span class="token punctuation">)</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>weakmap<span class="token punctuation">)</span>
</code></pre></div><p>\u5F53\u51FD\u6570 fn \u6267\u884C\u5B8C\u6BD5\u540E\uFF0C\u5BF9\u4E8E foo \u5BF9\u8C61\u6765\u8BF4\uFF0C\u5B83\u4F9D\u7136\u4F5C\u4E3A map \u7684 key \u88AB\u5F15\u7528\u7740\uFF0C\u56E0\u6B64\u5783\u573E\u56DE\u6536\u5668\u4E0D\u4F1A\u628A\u5B83\u4ECE\u5185\u5B58\u4E2D\u79FB\u9664\uFF0C\u6211\u4EEC\u4F9D\u7136\u53EF\u4EE5\u5728\u63A7\u5236\u53F0\u770B\u5230 map \u4E2D\u5B58\u5728 key \u4E3A foo \u5BF9\u8C61\u7684\u5C5E\u6027\uFF1B\u7531\u4E8E WeakMap \u662F\u5F31\u7C7B\u578B\u5F15\u7528\uFF0C\u4ED6\u4E0D\u4F1A\u5F71\u54CD\u5783\u573E\u56DE\u6536\u5668\u7684\u5DE5\u4F5C\uFF0C\u6240\u4EE5\u4E00\u65E6\u51FD\u6570 fn \u6267\u884C\u5B8C\u6BD5\uFF0C\u5C31\u4F1A\u628A bar \u5BF9\u8C61\u4ECE\u5185\u5B58\u4E2D\u79FB\u9664\uFF0C\u5E76\u4E14 weakmap \u4E2D\u4E5F\u4E0D\u4F1A\u5B58\u5728 bar \u5BF9\u8C61\u8FD9\u4E2A\u5C5E\u6027</p><h2 id="\u5206\u652F\u5207\u6362\u4E0E-cleanup" tabindex="-1">\u5206\u652F\u5207\u6362\u4E0E cleanup <a class="header-anchor" href="#\u5206\u652F\u5207\u6362\u4E0E-cleanup" aria-hidden="true">#</a></h2><h3 id="\u5206\u652F\u5207\u6362" tabindex="-1">\u5206\u652F\u5207\u6362 <a class="header-anchor" href="#\u5206\u652F\u5207\u6362" aria-hidden="true">#</a></h3><p>\u9996\u5148\u9700\u8981\u4E86\u89E3\u4E0B\u4EC0\u4E48\u662F\u5206\u652F\u5207\u6362</p><div class="language-js"><pre><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">ok</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token literal-property property">text</span><span class="token operator">:</span> <span class="token string">&#39;hello world&#39;</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> <span class="token punctuation">{</span><span class="token comment">/*...*/</span><span class="token punctuation">}</span><span class="token punctuation">)</span>

<span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;effect&#39;</span><span class="token punctuation">)</span>
    document<span class="token punctuation">.</span>body<span class="token punctuation">.</span>innerHTML <span class="token operator">=</span> obj<span class="token punctuation">.</span>ok <span class="token operator">?</span> obj<span class="token punctuation">.</span>text<span class="token operator">:</span> <span class="token string">&#39;not&#39;</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u526F\u4F5C\u7528\u51FD\u6570\u5185\u90E8\u5B58\u5728\u4E00\u4E2A\u4E09\u5143\u8868\u8FBE\u5F0F\uFF0C\u6839\u636E obj.ok \u503C\u7684\u4E0D\u540C\u4F1A\u6267\u884C\u4E0D\u540C\u7684\u4EE3\u7801\u5206\u652F\u3002\u5F53 obj.ok \u7684\u503C\u53D1\u751F\u6539\u53D8\u65F6\uFF0C\u4EE3\u7801\u6267\u884C\u7684\u5206\u652F\u5C31\u4F1A\u53D1\u751F\u6539\u53D8\uFF0C\u8FD9\u5C31\u662F\u6240\u8C13\u7684\u5206\u652F\u5207\u6362\u3002</p><h3 id="\u5EFA\u7ACB\u5173\u8054" tabindex="-1">\u5EFA\u7ACB\u5173\u8054 <a class="header-anchor" href="#\u5EFA\u7ACB\u5173\u8054" aria-hidden="true">#</a></h3><p>\u5206\u652F\u5207\u6362\u4F1A\u4EA7\u751F\u9057\u7559\u7684\u526F\u4F5C\u7528\u51FD\u6570\u3002\u6267\u884C\u4E0A\u9762\u7684\u4EE3\u7801\uFF0Cobj.ok \u4E3A true\uFF0C\u6B64\u65F6\u5C31\u4F1A\u89E6\u53D1 obj.ok \u548C obj.text \u8FD9\u4E24\u4E2A\u5C5E\u6027\u7684\u8BFB\u53D6\u64CD\u4F5C\uFF0C\u6B64\u65F6\u7684\u526F\u4F5C\u7528\u51FD\u6570 effectFn \u4E0E\u54CD\u5E94\u5F0F\u6570\u636E\u7684\u5173\u7CFB\u5982\u4E0B</p><div class="language-"><pre><code>data
  \u2514\u2500\u2500 ok
      \u2514\u2500\u2500  effectFn
  \u2514\u2500\u2500 text
      \u2514\u2500\u2500  effectFn
</code></pre></div><p>\u5F53\u4FEE\u6539 obj.ok \u7684\u503C\u4E3A false \u65F6\uFF0C\u4F1A\u89E6\u53D1\u526F\u4F5C\u7528\u51FD\u6570\u91CD\u65B0\u6267\u884C\uFF0C\u7531\u4E8E\u6B64\u65F6 obj.text \u4E0D\u4F1A\u88AB\u8BFB\u53D6\uFF0C\u53EA\u4F1A\u89E6\u53D1 obj.ok \u7684\u8BFB\u53D6\u64CD\u4F5C\uFF0C\u6240\u4EE5\u7406\u60F3\u60C5\u51B5\u4E0B\u6B64\u65F6 effectFn \u4E0E\u54CD\u5E94\u5F0F\u7684\u6570\u636E\u5982\u4E0B</p><div class="language-"><pre><code>data
  \u2514\u2500\u2500 ok
      \u2514\u2500\u2500  effectFn
</code></pre></div><p>\u5F88\u660E\u663E\uFF0C\u6309\u7167\u4E4B\u524D\u5199\u7684\uFF0C\u8FD8\u5B9E\u73B0\u4E0D\u4E86\u8FD9\u4E00\u70B9\u3002</p><p>\u89E3\u51B3\u8FD9\u4E2A\u95EE\u9898\u601D\u8DEF\u4E5F\u5F88\u7B80\u5355\uFF0C\u6211\u4EEC\u6BCF\u6B21\u6267\u884C\u526F\u4F5C\u7528\u51FD\u6570\u65F6\uFF0C\u5220\u9664\u6389\u4E4B\u524D\u7684\u4F9D\u8D56\u5173\u7CFB\uFF0C\u91CD\u65B0\u5EFA\u7ACB\u4F9D\u8D56\u5173\u7CFB\u5C31\u53EF\u4EE5\u4E86\u3002</p><p>\u9996\u5148\uFF0C\u8981\u5C06\u4E00\u4E2A\u526F\u4F5C\u7528\u51FD\u6570\u4ECE\u6240\u6709\u4E0E\u4E4B\u5173\u8054\u7684\u4F9D\u8D56\u96C6\u5408\u4E2D\u79FB\u9664\uFF0C\u5C31\u9700\u8981\u660E\u786E\u77E5\u9053\u54EA\u4E9B\u4F9D\u8D56\u96C6\u5408\u4E2D\u662F\u5426\u5305\u542B\u5B83\uFF0C\u6240\u4EE5\u9700\u8981\u526F\u4F5C\u7528\u51FD\u6570\u4E0E\u4F9D\u8D56\u96C6\u5408\u95F4\u5EFA\u7ACB\u8054\u7CFB</p><div class="language-js"><pre><code><span class="token keyword">let</span> activeEffect
<span class="token comment">// \u5C06\u526F\u4F5C\u7528\u51FD\u6570\u6DFB\u52A0\u4E00\u4E2A deps \u6570\u7EC4\uFF0C\u7528\u6765\u5B58\u50A8\u4E0E\u8BE5\u526F\u4F5C\u7528\u51FD\u6570\u76F8\u5173\u7684\u4F9D\u8D56\u96C6\u5408</span>
<span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">function</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        activeEffect <span class="token operator">=</span> effectFn
        <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    effectFn<span class="token punctuation">.</span>deps <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
    <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u5728 track \u51FD\u6570\u6267\u884C\u65F6\uFF0C\u53EF\u4EE5\u628A\u5F53\u524D\u4F9D\u8D56\u96C6\u5408\u6DFB\u52A0\u5230\u5F53\u524D\u526F\u4F5C\u7528\u51FD\u6570\u7684 deps \u6570\u7EC4\u4E2D\uFF0C\u8FD9\u6837\u8054\u7CFB\u5C31\u5EFA\u7ACB\u8D77\u6765\u4E86</p><div class="language-diff"><pre><code>function track(target, key) {
<span class="token unchanged"><span class="token prefix unchanged"> </span><span class="token line">   if (!activeEffect) return
</span><span class="token prefix unchanged"> </span><span class="token line">   let depsMap = bucket.get(target)
</span><span class="token prefix unchanged"> </span><span class="token line">   if (!depsMap) {
</span><span class="token prefix unchanged"> </span><span class="token line">       bucket.set(target, (depsMap = new Map()))
</span><span class="token prefix unchanged"> </span><span class="token line">   }
</span><span class="token prefix unchanged"> </span><span class="token line">   let deps = depsMap.get(key)
</span><span class="token prefix unchanged"> </span><span class="token line">   if (!deps) {
</span><span class="token prefix unchanged"> </span><span class="token line">       depsMap.set(key, (deps = new Set()))
</span><span class="token prefix unchanged"> </span><span class="token line">   }
</span><span class="token prefix unchanged"> </span><span class="token line">   // \u628A\u5F53\u524D\u6FC0\u6D3B\u7684\u526F\u4F5C\u7528\u51FD\u6570\u6DFB\u52A0\u5230\u4F9D\u8D56\u96C6\u5408 deps \u4E2D
</span><span class="token prefix unchanged"> </span><span class="token line">   deps.add(activeEffect)
</span></span><span class="token inserted-sign inserted"><span class="token prefix inserted">+</span><span class="token line">    // \u5C06\u5F53\u524D\u7684\u4F9D\u8D56\u96C6\u5408\u6DFB\u52A0\u5230 deps\u6570\u7EC4\u4E2D
</span><span class="token prefix inserted">+</span><span class="token line">    activeEffect.deps.push(deps)
</span></span>}
</code></pre></div><h3 id="cleanup" tabindex="-1">cleanup <a class="header-anchor" href="#cleanup" aria-hidden="true">#</a></h3><p>\u5EFA\u7ACB\u8054\u7CFB\u540E\uFF0C\u6BCF\u6B21\u6267\u884C\u526F\u4F5C\u7528\u51FD\u6570\u65F6\uFF0C \u6839\u636E\u526F\u4F5C\u7528\u51FD\u6570\u7684 deps \u6570\u7EC4\u4E2D\u5220\u9664\u6389\u6240\u6709\u76F8\u5173\u8054\u7684\u96C6\u5408\u3002</p><p>\u6211\u4EEC\u5C06\u6E05\u9664\u5DE5\u4F5C\u653E\u5230 cleanup \u51FD\u6570\u4E2D</p><div class="language-diff"><pre><code>let activeEffect
// \u5C06\u526F\u4F5C\u7528\u51FD\u6570\u6DFB\u52A0\u4E00\u4E2A deps \u6570\u7EC4\uFF0C\u7528\u6765\u5B58\u50A8\u4E0E\u8BE5\u526F\u4F5C\u7528\u51FD\u6570\u76F8\u5173\u7684\u4F9D\u8D56\u96C6\u5408
function effect(fn) {
<span class="token unchanged"><span class="token prefix unchanged"> </span><span class="token line">   function effectFn() {
</span><span class="token prefix unchanged"> </span><span class="token line">       activeEffect = effectFn
</span><span class="token prefix unchanged"> </span><span class="token line">       // \u6E05\u9664\u5DE5\u4F5C
</span></span><span class="token inserted-sign inserted"><span class="token prefix inserted">+</span><span class="token line">        cleanup(activeEffect)
</span></span><span class="token unchanged"><span class="token prefix unchanged"> </span><span class="token line">       fn()
</span><span class="token prefix unchanged"> </span><span class="token line">   }
</span><span class="token prefix unchanged"> </span><span class="token line">   effectFn.deps = []
</span><span class="token prefix unchanged"> </span><span class="token line">   effectFn()
</span></span>}
</code></pre></div><p>\u4E0B\u9762\u662F cleanup \u51FD\u6570\u7684\u5B9E\u73B0</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">cleanup</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> effectFn<span class="token punctuation">.</span>deps<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">const</span> deps <span class="token operator">=</span> effectFn<span class="token punctuation">.</span>deps<span class="token punctuation">[</span>i<span class="token punctuation">]</span>
        <span class="token comment">// \u628A effectFn \u4ECE\u4F9D\u8D56\u96C6\u5408\u4E2D\u5220\u9664</span>
        deps<span class="token punctuation">.</span><span class="token function">delete</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token comment">// \u91CD\u7F6E\u6570\u7EC4</span>
    effectFn<span class="token punctuation">.</span>deps<span class="token punctuation">.</span>length <span class="token operator">=</span> <span class="token number">0</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u7136\u540E\u6267\u884C\u4EE3\u7801\uFF0C\u6211\u4EEC\u4F1A\u53D1\u73B0\uFF0C\u4F1A\u53D1\u73B0\u4F1A\u5BFC\u81F4\u65E0\u9650\u5FAA\u73AF\uFF0C\u4F1A\u51FA\u73B0\u4E0B\u9762\u62A5\u9519\u4FE1\u606F</p><div class="language-"><pre><code>Uncaught RangeError: Maximum call stack size exceeded
</code></pre></div><p>\u51FA\u73B0\u7684\u539F\u56E0\u5C31\u5728\u6211\u4EEC\u5199\u7684 trigger \u51FD\u6570\u4E2D</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">trigger</span><span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> key</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> depsMap <span class="token operator">=</span> bucket<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token keyword">return</span>
    <span class="token keyword">const</span> deps <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span>
    <span class="token comment">// \u95EE\u9898\u51FA\u73B0\u5728\u8FD9\u91CC</span>
    deps <span class="token operator">&amp;&amp;</span> deps<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">fn</span> <span class="token operator">=&gt;</span> <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u6211\u4EEC\u904D\u5386 deps \u96C6\u5408\uFF0C\u4F1A\u6267\u884C\u4E0B\u9762\u51E0\u4E2A\u6B65\u9AA4</p><ol><li>\u6267\u884C\u96C6\u5408\u4E2D\u5B58\u50A8\u7684\u526F\u4F5C\u7528\u51FD\u6570 effectFn</li><li>\u526F\u4F5C\u7528\u51FD\u6570\u6267\u884C\u8FC7\u7A0B\u4E2D\uFF0C\u4F1A\u8C03\u7528 cleanup \u6E05\u9664\u76F8\u5173\u4F9D\u8D56</li><li>\u7136\u540E\u5728\u8C03\u7528\u6211\u4EEC\u4F20\u5165\u7684\u526F\u4F5C\u7528\u51FD\u6570 fn</li><li>\u6267\u884C\u6211\u4EEC\u4F20\u5165\u7684\u526F\u4F5C\u7528\u51FD\u6570 fn \u65F6\uFF0C\u4F1A\u5BFC\u81F4\u91CD\u65B0\u88AB\u6536\u96C6\u5230\u4F9D\u8D56\u4E2D</li></ol><p>\u5B9E\u9645\u4E0A\u6267\u884C\u8FC7\u7A0B\u5C31\u8DDF\u4E0B\u9762\u7684\u7C7B\u4F3C</p><div class="language-js"><pre><code><span class="token keyword">const</span> set <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">)</span>
set<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    set<span class="token punctuation">.</span><span class="token function">delete</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    set<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;\u904D\u5386\u4E2D&#39;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span> 
</code></pre></div><p>\u6267\u884C\u4EE3\u7801\u540E\uFF0C\u6211\u4EEC\u53D1\u73B0\u4E00\u76F4\u65E0\u9650\u6253\u5370 &#39;\u904D\u5386\u4E2D&#39;</p><div class="tip custom-block"><p class="custom-block-title">\u8BED\u8A00\u89C4\u8303\u8BF4\u660E</p><p>\u5728\u8C03\u7528 forEach \u904D\u5386 Set \u96C6\u5408\u65F6\uFF0C\u5982\u679C\u4E00\u4E2A\u503C\u5DF2\u7ECF\u88AB\u8BBF\u95EE\u8FC7\u4E86\uFF0C\u4F46\u8BE5\u503C\u88AB\u5220\u9664\u5E76\u91CD\u65B0\u6DFB\u52A0\u5230\u96C6\u5408\u4E2D\uFF0C\u5982\u679C\u6B64\u65F6\u904D\u5386\u6CA1\u6709\u7ED3\u675F\uFF0C\u90A3\u4E48\u8BE5\u503C\u4F1A\u88AB\u91CD\u65B0\u8BBF\u95EE</p></div><p>\u89E3\u51B3\u529E\u6CD5\u5F88\u7B80\u5355\uFF0C\u53EF\u4EE5\u53E6\u5916\u6784\u9020\u4E00\u4E2A Set \u96C6\u5408\u5E76\u904D\u5386\u5B83</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">trigger</span><span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> key</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> depsMap <span class="token operator">=</span> bucket<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token keyword">return</span>
    <span class="token keyword">const</span> deps <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span>
    <span class="token keyword">const</span> effectsToRun <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span>deps<span class="token punctuation">)</span>
    effectsToRun <span class="token operator">&amp;&amp;</span> effectsToRun<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">fn</span> <span class="token operator">=&gt;</span> <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u6267\u884C\u8FC7\u7A0B\u4E2D\uFF0C\u4F9D\u8D56\u5220\u9664\u548C\u589E\u52A0\u662F\u4E0D\u4F1A\u5F71\u54CD\u5230 effectsToRun \u7684\uFF0C\u6240\u4EE5\u5C31\u4E0D\u4F1A\u51FA\u73B0\u65E0\u9650\u5FAA\u73AF\u4E86</p><h2 id="\u5D4C\u5957\u7684-effect-\u4E0E-effect-\u6808" tabindex="-1">\u5D4C\u5957\u7684 effect \u4E0E effect \u6808 <a class="header-anchor" href="#\u5D4C\u5957\u7684-effect-\u4E0E-effect-\u6808" aria-hidden="true">#</a></h2><p>effect \u662F\u53EF\u4EE5\u53D1\u751F\u5D4C\u5957\u7684\uFF0C\u4F8B\u5982</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token keyword">function</span> <span class="token function">effectFn1</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">/*... */</span>
    <span class="token function">effect</span><span class="token punctuation">(</span><span class="token keyword">function</span> <span class="token function">effectFn2</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">/*... */</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u4EC0\u4E48\u573A\u666F\u4F1A\u53D1\u751F effect \u5D4C\u5957\u5462\uFF1F\u5B9E\u9645\u4E0A Vue.js \u7684\u6E32\u67D3\u51FD\u6570\u5C31\u662F\u5728 effect \u4E2D\u6267\u884C\u7684</p><div class="language-js"><pre><code><span class="token keyword">const</span> Foo <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token comment">/* ... */</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u5728\u4E00\u4E2A effect \u51FD\u6570\u4E2D\u6267\u884C Foo \u7EC4\u4EF6\u7684\u6E32\u67D3\u51FD\u6570</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    Foo<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5F53\u7EC4\u4EF6\u53D1\u751F\u5D4C\u5957\u65F6</p><div class="language-js"><pre><code><span class="token keyword">const</span> Bar <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token comment">/* .... */</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> Foo <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token operator">&lt;</span>Bar<span class="token operator">/</span><span class="token operator">&gt;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u6B64\u65F6\u5C06\u76F8\u5F53\u4E8E</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token comment">// \u5D4C\u5957</span>
    <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        Bar<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u6240\u4EE5 effect \u51FD\u6570\u5E94\u8BE5\u8BBE\u8BA1\u6210\u53EF\u5D4C\u5957\u7684</p><div class="language-js"><pre><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token string">&#39;foo&#39;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">bar</span><span class="token operator">:</span> <span class="token string">&#39;bar&#39;</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> <span class="token punctuation">{</span><span class="token comment">/*...*/</span><span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token function">effect</span><span class="token punctuation">(</span><span class="token keyword">function</span> <span class="token function">effectFn1</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;effectFn1 \u6267\u884C&#39;</span><span class="token punctuation">)</span>
    <span class="token function">effect</span><span class="token punctuation">(</span><span class="token keyword">function</span> <span class="token function">effectFn2</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;effectFn2 \u6267\u884C&#39;</span><span class="token punctuation">)</span>
        document<span class="token punctuation">.</span><span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">&#39;#bar&#39;</span><span class="token punctuation">)</span><span class="token punctuation">.</span>innerHTML <span class="token operator">=</span>  obj<span class="token punctuation">.</span>bar
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    document<span class="token punctuation">.</span><span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">&#39;#foo&#39;</span><span class="token punctuation">)</span><span class="token punctuation">.</span>innerHTML <span class="token operator">=</span> obj<span class="token punctuation">.</span>foo
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u7406\u60F3\u60C5\u51B5\u4E0B\uFF0C\u6211\u4EEC\u5E0C\u671B\u7684\u526F\u4F5C\u7528\u51FD\u6570\u4E0E\u5BF9\u8C61\u5C5E\u6027\u95F4\u7684\u8054\u7CFB</p><div class="language-js"><pre><code>data
  \u2514\u2500\u2500 foo
       \u2514\u2500\u2500  effectFn1
  \u2514\u2500\u2500 bar
       \u2514\u2500\u2500  effectFn2
</code></pre></div><p>\u5F53\u4FEE\u6539 obj.bar \u65F6\uFF0C\u4F1A\u6253\u5370\uFF1A</p><div class="language-"><pre><code>effectFn2 \u6267\u884C
</code></pre></div><p>\u5F88\u660E\u663E\uFF0C\u4E0D\u7B26\u5408\u6211\u4EEC\u7684\u9884\u671F\uFF0C\u95EE\u9898\u5C31\u51FA\u5728 effect \u51FD\u6570 \u548C activeEffect \u4E0A\uFF0C\u5F53\u6211\u4EEC\u4F7F\u7528 activeEffect \u6765\u5B58\u50A8\u526F\u4F5C\u7528\u51FD\u6570\u65F6\uFF0C\u610F\u5473\u7740\u540C\u65F6\u53EA\u80FD\u6709\u4E00\u4E2A\u526F\u4F5C\u7528\u51FD\u6570\uFF0C\u5F53\u526F\u4F5C\u7528\u5D4C\u5957\u65F6\uFF0C\u5185\u5C42\u526F\u4F5C\u7528\u51FD\u6570\u5C31\u4F1A\u8986\u76D6\u5916\u5C42 activeEffect \u7684\u503C</p><div class="language-js"><pre><code><span class="token keyword">let</span> activeEffect
<span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

    <span class="token keyword">function</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        activeEffect <span class="token operator">=</span> effectFn
        <span class="token function">cleanup</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    effectFn<span class="token punctuation">.</span>deps <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
    <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u4E3A\u4E86\u89E3\u51B3\u8FD9\u4E2A\u95EE\u9898\uFF0C\u6211\u4EEC\u9700\u8981\u4E00\u4E2A\u526F\u4F5C\u7528\u51FD\u6570\u6808\uFF0C\u5F53\u526F\u4F5C\u7528\u51FD\u6570\u6267\u884C\u65F6\uFF0C\u5C31\u4F1A\u5C06 activeEffect \u538B\u5165\u6808\u4E2D\uFF0C\u6267\u884C\u5B8C\u6BD5\u540E\uFF0C\u5728\u628A activeEffect \u4ECE\u6808\u4E2D\u5F39\u51FA</p><p><img src="`+o+`" alt=""></p><h2 id="\u907F\u514D\u65E0\u9650\u9012\u5F52\u5FAA\u73AF" tabindex="-1">\u907F\u514D\u65E0\u9650\u9012\u5F52\u5FAA\u73AF <a class="header-anchor" href="#\u907F\u514D\u65E0\u9650\u9012\u5F52\u5FAA\u73AF" aria-hidden="true">#</a></h2><p>\u5F53\u6211\u4EEC\u6267\u884C\u4E0B\u9762\u4EE3\u7801\u65F6:</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    obj<span class="token punctuation">.</span>foo<span class="token operator">++</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u63A7\u5236\u53F0\u4F1A\u629B\u51FA\u5F02\u5E38</p><div class="language-"><pre><code>Uncaught RangeError: Maximum call stack size exceeded
</code></pre></div><p>\u4E0A\u9762\u7684\u4EE3\u7801\u4E2D\u6211\u4EEC\u65E2\u4F1A\u8BFB\u53D6 foo \u7684\u503C\uFF0C\u4E5F\u4F1A\u8BBE\u7F6E foo \u7684\u503C</p><ol><li>\u6267\u884C\u526F\u4F5C\u7528\u51FD\u6570\uFF0C\u9996\u5148\u8BFB\u53D6 foo \u7684\u503C\uFF0C\u4F1A\u89E6\u53D1 track \u64CD\u4F5C</li><li>\u8BBE\u7F6E foo \u7684\u503C\uFF0C\u4F1A\u89E6\u53D1 trigger \u64CD\u4F5C</li><li>\u8FD9\u65F6\u8BE5\u526F\u4F5C\u7528\u51FD\u6570\u8FD8\u6CA1\u6709\u6267\u884C\u5B8C\u6BD5\uFF0C trigger \u51FD\u6570\u4E2D\u6267\u884C\u8FC7\u7A0B\u4E2D\u4F1A\u518D\u6B21\u89E6\u53D1\u6267\u884C\u526F\u4F5C\u7528\u51FD\u6570\u3002</li><li>\u6267\u884C\u526F\u4F5C\u7528\u51FD\u6570\u53C8\u56DE\u5230\u4E86\u7B2C 1 \u6B65\uFF0C\u5BFC\u81F4\u65E0\u9650\u8C03\u7528\u81EA\u5DF1</li></ol><p>\u5BF9\u6B64\uFF0C\u6211\u4EEC\u53EF\u4EE5\u5BF9 trigger \u51FD\u6570\u589E\u52A0\u5B88\u536B\u6761\u4EF6\uFF1A \u5982\u679C trigger \u51FD\u6570\u89E6\u53D1\u6267\u884C\u7684\u526F\u4F5C\u7528\u51FD\u6570\u4E0E\u5F53\u524D\u6B63\u5728\u6267\u884C\u7684\u526F\u4F5C\u7528\u51FD\u6570\u76F8\u540C\uFF0C\u5219\u4E0D\u89E6\u53D1\u6267\u884C\u8BE5\u526F\u4F5C\u7528\u51FD\u6570</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">trigger</span><span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> key</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> depsMap <span class="token operator">=</span> bucket<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token keyword">return</span>
    <span class="token keyword">const</span> deps <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span>
    <span class="token keyword">const</span> effectsToRun <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token comment">// \u904D\u5386\u5F80 effectsToRun \u4E0A\u6DFB\u52A0\u526F\u4F5C\u7528\u51FD\u6570</span>
    deps <span class="token operator">&amp;&amp;</span> deps<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token comment">// \u5982\u679C\u5F53\u524D\u6267\u884C\u7684\u526F\u4F5C\u7528\u51FD\u6570 activeEffect \u4E0E\u5F53\u524D</span>
        <span class="token comment">// \u904D\u5386\u5230\u7684\u526F\u4F5C\u7528\u51FD\u6570effectFn \u76F8\u540C\uFF0C\u5C31\u4E0D\u6DFB\u52A0</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>activeEffect <span class="token operator">!==</span> effectFn<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            effectsToRun<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    effectsToRun<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span> <span class="token operator">=&gt;</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u8FD9\u6837\u5C31\u89E3\u51B3\u4E86\u65E0\u9650\u9012\u5F52\u5FAA\u73AF\u7684\u95EE\u9898</p><h2 id="\u8C03\u5EA6\u6267\u884C" tabindex="-1">\u8C03\u5EA6\u6267\u884C <a class="header-anchor" href="#\u8C03\u5EA6\u6267\u884C" aria-hidden="true">#</a></h2><p>\u53EF\u8C03\u5EA6\u6027\u662F\u54CD\u5E94\u5F0F\u7CFB\u7EDF\u7684\u975E\u5E38\u91CD\u8981\u7684\u4E00\u4E2A\u7279\u6027\u3002</p><div class="tip custom-block"><p class="custom-block-title">\u4EC0\u4E48\u662F\u53EF\u8C03\u5EA6</p><p>\u5C31\u662F\u5F53 trigger \u52A8\u4F5C\u89E6\u53D1\u526F\u4F5C\u7528\u51FD\u6570\u6267\u884C\u65F6\uFF0C\u6709\u80FD\u529B\u51B3\u5B9A\u526F\u4F5C\u7528\u51FD\u6570\u7684\u65F6\u673A\u3001\u6B21\u6570\u4EE5\u53CA\u65B9\u5F0F\u3002</p></div><p>\u4E3A\u4E86\u8C03\u7528\u65B9\u4FBF\uFF0C\u6211\u4EEC\u628A\u4EE3\u7406\u5BF9\u8C61\u7ED9\u5C01\u88C5\u5230\u4E00\u4E2A\u51FD\u6570\u4E2D</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">proxy</span><span class="token punctuation">(</span><span class="token parameter">data</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">track</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">)</span>
            <span class="token keyword">return</span> target<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">,</span> newVal<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            target<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> newVal
            <span class="token function">trigger</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">)</span>
            <span class="token keyword">return</span> <span class="token boolean">true</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u770B\u4E0B\u9762\u4EE3\u7801</p><div class="language-js"><pre><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token function">proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
<span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
obj<span class="token punctuation">.</span>foo<span class="token operator">++</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;\u7ED3\u675F\u5566&#39;</span><span class="token punctuation">)</span>
</code></pre></div><p>\u6267\u884C\u7ED3\u679C\u662F</p><div class="language-"><pre><code>1
2
\u7ED3\u675F\u5566
</code></pre></div><p>\u5047\u8BBE\u9700\u6C42\u6709\u53D8\uFF0C\u8F93\u51FA\u7684\u987A\u5E8F\u9700\u8981\u8C03\u6574\u4E3A</p><div class="language-"><pre><code>1
\u7ED3\u675F\u5566
2
</code></pre></div><p>\u6211\u4EEC\u53EF\u80FD\u4F1A\u4FEE\u6539\u4EE3\u7801\u7684\u987A\u5E8F\uFF0C\u4F46\u662F\u6709\u4EC0\u4E48\u529E\u6CD5\u53EF\u4EE5\u4E0D\u4FEE\u6539\u4EE3\u7801\u5C31\u80FD\u62FF\u5B9E\u73B0\u4E0A\u9762\u7684\u9700\u6C42\u5462\uFF1F\u8FD9\u65F6\u5C31\u9700\u8981\u6211\u4EEC\u8BBE\u8BA1\u7684\u54CD\u5E94\u5F0F\u7CFB\u7EDF\u652F\u6301\u53EF\u8C03\u5EA6</p><p>\u6211\u4EEC\u53EF\u4EE5\u4E3A\u6211\u4EEC\u7684 effect \u51FD\u6570\u8BBE\u8BA1\u4E00\u4E2A\u9009\u9879\u53C2\u6570 options \uFF0C\u5141\u8BB8\u7528\u6237\u6307\u5B9A\u8C03\u5EA6\u5668</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span>
    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// options</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// \u8C03\u5EA6\u5668 scheduler \u662F\u4E00\u4E2A\u51FD\u6570</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">)</span>
</code></pre></div><p>\u540C\u65F6\uFF0Ceffect \u51FD\u6570\u9700\u8981\u652F\u6301\u7B2C\u4E8C\u4E2A\u53C2\u6570\u7684\u4F20\u9012\uFF0C\u5E76\u5C06 options \u9009\u9879\u6302\u8F7D\u5230\u526F\u4F5C\u7528\u51FD\u6570 effetcFn</p><div class="language-js"><pre><code><span class="token keyword">let</span> activeEffect
<span class="token keyword">const</span> effectStack <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
<span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn<span class="token punctuation">,</span> options <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">function</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">cleanup</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        activeEffect <span class="token operator">=</span> effectFn
        effectStack<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        effectStack<span class="token punctuation">.</span><span class="token function">pop</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        activeEffect <span class="token operator">=</span> effectStack<span class="token punctuation">[</span>effectStack<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">]</span>
    <span class="token punctuation">}</span>
    <span class="token comment">// \u5C06 options \u6302\u8F7D\u5230 effectFn \u4E0A</span>
    effectFn<span class="token punctuation">.</span>options <span class="token operator">=</span> options
    effectFn<span class="token punctuation">.</span>deps <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
    <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u6211\u4EEC\u5728trigger \u51FD\u6570\u4E2D\u6267\u884C\u526F\u4F5C\u7528\u51FD\u6570\u65F6\uFF0C\u5C31\u53EF\u4EE5\u62FF\u5230 options.scheduler \u9009\u9879</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">trigger</span><span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> key</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> depsMap <span class="token operator">=</span> bucket<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token keyword">return</span>
    <span class="token keyword">const</span> deps <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span>
    <span class="token keyword">const</span> effectsToRun <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    deps <span class="token operator">&amp;&amp;</span> deps<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>activeEffect <span class="token operator">!==</span> effectFn<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            effectsToRun<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    effectsToRun<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token comment">// \u5B58\u5728\u8C03\u5EA6\u5668\uFF0C\u5C31\u8C03\u7528\u8C03\u5EA6\u5668\uFF0C\u5E76\u628A\u526F\u4F5C\u7528\u51FD\u6570\u4F5C\u4E3A\u53C2\u6570\u4F20\u9012</span>
        <span class="token comment">// \u5426\u5219\uFF0C\u5C31\u76F4\u63A5\u6267\u884C\u526F\u4F5C\u7528\u51FD\u6570</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>effectFn<span class="token punctuation">.</span>options<span class="token punctuation">.</span>scheduler<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            effectFn<span class="token punctuation">.</span>options<span class="token punctuation">.</span><span class="token function">scheduler</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u6211\u4EEC\u518D\u6765\u5B9E\u73B0\u4E4B\u524D\u7684\u9700\u6C42</p><div class="language-js"><pre><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token function">proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
<span class="token function">effect</span><span class="token punctuation">(</span>
    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// options</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// \u8C03\u5EA6\u5668 scheduler \u662F\u4E00\u4E2A\u51FD\u6570</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">setTimeout</span><span class="token punctuation">(</span>fn<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">)</span>
obj<span class="token punctuation">.</span>foo<span class="token operator">++</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;\u7ED3\u675F\u5566&#39;</span><span class="token punctuation">)</span>
</code></pre></div><p>\u6267\u884C\u540E</p><div class="language-"><pre><code>1
\u7ED3\u675F\u5566
2
</code></pre></div><p>\u540C\u6837\uFF0C\u901A\u8FC7\u8C03\u5EA6\u5668\u8FD8\u53EF\u4EE5\u63A7\u5236\u5B83\u7684\u6267\u884C\u6B21\u6570\uFF0C\u4F8B\u5982\u4E0B\u9762\u4EE3\u7801</p><div class="language-js"><pre><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token function">proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
<span class="token function">effect</span><span class="token punctuation">(</span>
    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">)</span>
obj<span class="token punctuation">.</span>foo<span class="token operator">++</span>
obj<span class="token punctuation">.</span>foo<span class="token operator">++</span>
</code></pre></div><p>\u5982\u679C\u6211\u4EEC\u53EA\u5173\u5FC3\u7ED3\u679C\uFF0C\u4E0D\u5173\u5FC3\u8FC7\u7A0B\uFF0C\u6211\u4EEC\u671F\u671B\u6253\u5370\u7ED3\u679C\u4E3A</p><div class="language-"><pre><code>1
3
</code></pre></div><p>\u6211\u4EEC\u81EA\u5DF1\u8BBE\u8BA1\u4E00\u4E2A\u4EFB\u52A1\u961F\u5217\u51FD\u6570</p><div class="language-js"><pre><code><span class="token keyword">const</span> jobQueue <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token keyword">const</span> p <span class="token operator">=</span> Promise<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token keyword">let</span> isFlushing <span class="token operator">=</span> <span class="token boolean">false</span>
<span class="token keyword">function</span> <span class="token function">flushJob</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>isFlushing<span class="token punctuation">)</span> <span class="token keyword">return</span>
    isFlushing <span class="token operator">=</span> <span class="token boolean">true</span>
    p<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        jobQueue<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">job</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
            <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">finally</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token punctuation">{</span>
            isFlushing <span class="token operator">=</span> <span class="token boolean">false</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token function">proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
<span class="token function">effect</span><span class="token punctuation">(</span>
    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
            jobQueue<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
            <span class="token function">flushJob</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">)</span>
obj<span class="token punctuation">.</span>foo<span class="token operator">++</span>
obj<span class="token punctuation">.</span>foo<span class="token operator">++</span>
</code></pre></div><p>\u5F53\u6211\u4EEC\u4FEE\u6539 foo \u7684\u503C\u65F6</p><ul><li>\u4F1A\u89E6\u53D1 scheduler \u51FD\u6570\uFF0C \u4F1A\u5C06\u526F\u4F5C\u7528\u51FD\u6570\u6DFB\u52A0\u5230\u4EFB\u52A1\u961F\u5217 flushJob \u4E0A\uFF0C\u6700\u7EC8\u4F1A\u904D\u5386\u6267\u884C flushJob \u4E0A\u7684\u526F\u4F5C\u7528\u51FD\u6570</li><li>\u518D\u6B21\u4FEE\u6539 foo \u7684\u503C\u65F6\uFF0C\u8C03\u7528 flushJob \u65F6\uFF0CisFlushing \u4E3A true\uFF0C\u6240\u4EE5\u4E0D\u4F1A\u89E6\u53D1\u6267\u884C\u526F\u4F5C\u7528\u51FD\u6570</li><li>\u6240\u4EE5 flushJob \u4E0A\u503C\u53EA\u5B58\u5728\u4E00\u4E2A\u526F\u4F5C\u7528\u51FD\u6570</li><li>\u7531\u4E8E flushJob \u7684\u6267\u884C\u662F\u5F02\u6B65\u7684\uFF0C\u6240\u4EE5\uFF0C\u5728\u6267\u884C\u526F\u4F5C\u7528\u65F6\uFF0C foo \u7684\u503C\u5C31\u5DF2\u7ECF\u662F 3 \u4E86</li></ul><p>\u6240\u4EE5\u63A7\u5236\u53F0\u4F1A\u6253\u5370</p><div class="language-"><pre><code>1
3
</code></pre></div><h2 id="\u8BA1\u7B97\u5C5E\u6027-computed-\u4E0E-lazy" tabindex="-1">\u8BA1\u7B97\u5C5E\u6027 computed \u4E0E lazy <a class="header-anchor" href="#\u8BA1\u7B97\u5C5E\u6027-computed-\u4E0E-lazy" aria-hidden="true">#</a></h2><p>\u5728\u4E4B\u524D\u6211\u4EEC\u8BBE\u8BA1\u7684 effect \u51FD\u6570\uFF0C\u8C03\u7528effect \u51FD\u6570\u4FBF\u4F1A\u6267\u884C\u6211\u4EEC\u4F20\u9012\u7684\u526F\u4F5C\u7528\u51FD\u6570</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5728\u6709\u4E9B\u573A\u666F\u4E0B\uFF0C\u6211\u4EEC\u4E0D\u5E0C\u671B\u5728\u8C03\u7528 effect \u51FD\u6570\u65F6\u6267\u884C\u4F20\u9012\u7684\u526F\u4F5C\u7528\u51FD\u6570\uFF0C\u800C\u662F\u5728\u9700\u8981\u5B83\u6267\u884C\u7684\u65F6\u5019\u518D\u6267\u884C\uFF0C\u8FD9\u5C31\u662F\u61D2\u6267\u884C\u7684 effect \u3002\u4F8B\u5982\u6211\u4EEC\u5E0C\u671B\u6211\u4EEC\u6307\u5B9A options.lazy \u4E3A true \u65F6\u9700\u8981\u61D2\u6267\u884C\u7684 effect</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u4E0B\u9762\u4FEE\u6539 effect \u51FD\u6570</p><div class="language-js"><pre><code><span class="token keyword">let</span> activeEffect
<span class="token keyword">const</span> effectStack <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
<span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn<span class="token punctuation">,</span> options <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">function</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">cleanup</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        activeEffect <span class="token operator">=</span> effectFn
        effectStack<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        effectStack<span class="token punctuation">.</span><span class="token function">pop</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        activeEffect <span class="token operator">=</span> effectStack<span class="token punctuation">[</span>effectStack<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">]</span>
    <span class="token punctuation">}</span>
    effectFn<span class="token punctuation">.</span>options <span class="token operator">=</span> options
    effectFn<span class="token punctuation">.</span>deps <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
    <span class="token comment">// \u975Elazy\u624D\u6267\u884C\u526F\u4F5C\u7528\u51FD\u6570</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>options<span class="token punctuation">.</span>lazy<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> effectFn
<span class="token punctuation">}</span>
</code></pre></div><p>\u8FD9\u6837\u5C31\u5B9E\u73B0\u624B\u52A8\u8C03\u7528 effect \u51FD\u6570\u4E86</p><div class="language-js"><pre><code><span class="token keyword">const</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>

<span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">)</span>
</code></pre></div><p>\u4F46\u662F\uFF0C\u5982\u679C\u4EC5\u4EC5\u53EF\u4EE5\u624B\u52A8\u6267\u884C effect \u51FD\u6570\uFF0C\u610F\u4E49\u4E0D\u5927\uFF0C\u5982\u679C\u6211\u4EEC\u4F20\u9012\u7ED9 effect \u51FD\u6570\u770B\u505A\u4E00\u4E2A getter , \u90A3\u4E48 getter \u51FD\u6570\u53EF\u4EE5\u8FD4\u56DE\u4EFB\u4F55\u503C</p><div class="language-js"><pre><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token function">proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
<span class="token keyword">const</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>


<span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token comment">// value \u5C31\u662Fgetter \u7684\u8FD4\u56DE\u503C</span>
    <span class="token keyword">const</span> value <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">)</span>
</code></pre></div><p>\u6211\u4EEC\u9700\u8981\u5BF9 effect \u8FDB\u884C\u4FEE\u6539</p><div class="language-diff"><pre><code><span class="token unchanged"><span class="token prefix unchanged"> </span><span class="token line">let activeEffect
</span><span class="token prefix unchanged"> </span><span class="token line">const effectStack = []
</span><span class="token prefix unchanged"> </span><span class="token line">function effect(fn, options = {}) {
</span><span class="token prefix unchanged"> </span><span class="token line">    function effectFn() {
</span><span class="token prefix unchanged"> </span><span class="token line">        cleanup(effectFn)
</span><span class="token prefix unchanged"> </span><span class="token line">        activeEffect = effectFn
</span><span class="token prefix unchanged"> </span><span class="token line">        effectStack.push(effectFn)
</span></span><span class="token inserted-sign inserted"><span class="token prefix inserted">+</span><span class="token line">        const res = fn()
</span></span><span class="token unchanged"><span class="token prefix unchanged"> </span><span class="token line">        effectStack.pop()
</span><span class="token prefix unchanged"> </span><span class="token line">        activeEffect = effectStack[effectStack.length - 1]
</span></span><span class="token inserted-sign inserted"><span class="token prefix inserted">+</span><span class="token line">        // \u8FD4\u56DE\u526F\u4F5C\u7528\u51FD\u6570\u6267\u884C\u7684\u7ED3\u679C
</span><span class="token prefix inserted">+</span><span class="token line">        return res
</span></span><span class="token unchanged"><span class="token prefix unchanged"> </span><span class="token line">    }
</span><span class="token prefix unchanged"> </span><span class="token line">    effectFn.options = options
</span><span class="token prefix unchanged"> </span><span class="token line">    effectFn.deps = []
</span><span class="token prefix unchanged"> </span><span class="token line">    if (!options.lazy) {
</span><span class="token prefix unchanged"> </span><span class="token line">        effectFn()
</span><span class="token prefix unchanged"> </span><span class="token line">    }
</span><span class="token prefix unchanged"> </span><span class="token line">    return effectFn
</span><span class="token prefix unchanged"> </span><span class="token line">}
</span></span></code></pre></div><p>\u8FD9\u6837\u6211\u4EEC\u5C31\u62FF\u5230\u4E86\u4F20\u9012\u7ED9 effect \u7684\u5BCC\u4F5C\u7528\u51FD\u6570\u7684\u8FD4\u56DE\u503C\u4E86</p><p>\u6267\u884C\u4E0B\u9762\u4EE3\u7801</p><div class="language-js"><pre><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
    <span class="token literal-property property">b</span><span class="token operator">:</span> <span class="token number">2</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token function">proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
<span class="token keyword">const</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">value</span><span class="token operator">:</span> obj<span class="token punctuation">.</span>a <span class="token operator">+</span> obj<span class="token punctuation">.</span>b
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>


<span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token comment">// value \u5C31\u662Fgetter \u7684\u8FD4\u56DE\u503C</span>
    <span class="token keyword">const</span> value <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5982\u679C\u6211\u4EEC\u5C06\u4E0A\u9762\u4EE3\u7801\uFF0C\u7A0D\u52A0\u6539\u9020\uFF0C\u5C31\u6210\u4E86\u6211\u4EEC\u719F\u6089\u4F7F\u7528\u7684\u8BA1\u7B97\u5C5E\u6027 computed \u4E86</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token parameter">getter</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token keyword">const</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">vale</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> obj
<span class="token punctuation">}</span>
</code></pre></div><p>\u8FD0\u884C\u4E0B\u9762\u4EE3\u7801</p><div class="language-js"><pre><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
    <span class="token literal-property property">b</span><span class="token operator">:</span> <span class="token number">2</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token function">proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
<span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
    <span class="token literal-property property">b</span><span class="token operator">:</span> <span class="token number">2</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token function">proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
<span class="token keyword">const</span> count <span class="token operator">=</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span><span class="token punctuation">{</span>
    <span class="token keyword">return</span> obj<span class="token punctuation">.</span>a <span class="token operator">+</span> obj<span class="token punctuation">.</span>b
<span class="token punctuation">}</span><span class="token punctuation">)</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>count<span class="token punctuation">.</span>value<span class="token punctuation">)</span> <span class="token comment">// 3</span>
</code></pre></div><p>\u5C31\u8FD9\u6837\uFF0C\u8BA1\u7B97\u5C5E\u6027\u7684\u529F\u80FD\u5C31\u5B9E\u73B0\u4E86\u3002\u4E0D\u8FC7\u73B0\u5728\u8BA1\u7B97\u5C5E\u6027\u7684\u503C\u53EA\u505A\u5230\u4E86\u61D2\u52A0\u8F7D\uFF08\u5F53\u8C03\u7528 count.value \u7684\u662F\u65F6\u5019\u624D\u4F1A\u53BB\u6267\u884C\u8BA1\u7B97\uFF09\uFF0C\u5E76\u6CA1\u6709\u505A\u5230\u5BF9\u503C\u8FDB\u884C\u7F13\u5B58\u3002\u6211\u4EEC\u591A\u6B21\u8FDB\u884C\u8BBF\u95EE\uFF0C\u5B83\u5C31\u4F1A\u8FDB\u884C\u591A\u6B21\u8BA1\u7B97</p><div class="language-js"><pre><code>console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>count<span class="token punctuation">.</span>value<span class="token punctuation">)</span> <span class="token comment">// 3</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>count<span class="token punctuation">.</span>value<span class="token punctuation">)</span> <span class="token comment">// 3</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>count<span class="token punctuation">.</span>value<span class="token punctuation">)</span> <span class="token comment">// 3</span>
</code></pre></div><p>\u4E0B\u9762\u5BF9 computed \u51FD\u6570\u8FDB\u884C\u4FEE\u6539</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token parameter">getter</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token keyword">let</span> value
    <span class="token keyword">let</span> dirty <span class="token operator">=</span> <span class="token boolean">true</span>
    <span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span><span class="token punctuation">(</span>dirty<span class="token punctuation">)</span><span class="token punctuation">{</span>
                value <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                dirty <span class="token operator">=</span> <span class="token boolean">false</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> value
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> obj
<span class="token punctuation">}</span>
</code></pre></div><p>\u4FEE\u6539\u5B8C\u540E\uFF0C\u6211\u4EEC\u53D1\u73B0\u518D\u6B21\u4FEE\u6539 obj.foo \u6216 obj.bar \u7684\u503C\u65F6\uFF0C\u8FD4\u56DE\u503C\u6CA1\u6709\u53D1\u751F\u53D8\u5316</p><div class="language-js"><pre><code>console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>count<span class="token punctuation">.</span>value<span class="token punctuation">)</span> <span class="token comment">// 3</span>
obj<span class="token punctuation">.</span>a<span class="token operator">++</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>count<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token comment">// 3</span>
</code></pre></div><p>\u8FD9\u662F\u56E0\u4E3A\u7B2C\u4E00\u6B21\u8BBF\u95EE count.value \u7684\u503C\u540E\uFF0Cdirty \u53D8\u6210\u4E86 false \uFF0C\u53EA\u6709\u5F53 dirty \u4E3A true \u65F6\uFF0C\u624D\u4F1A\u91CD\u65B0\u8BA1\u7B97</p><p>\u6211\u4EEC\u9700\u8981\uFF0C\u4F46\u6211\u4EEC\u4FEE\u6539 obj.foo \u6216 obj.bar \u7684\u503C\u53D1\u751F\u53D8\u5316\u65F6\uFF0Cdirty \u91CD\u65B0\u53D8\u4E3A true</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token parameter">getter</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> value
    <span class="token keyword">let</span> dirty <span class="token operator">=</span> <span class="token boolean">true</span>
    <span class="token keyword">const</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            dirty <span class="token operator">=</span> <span class="token boolean">true</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>dirty<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                value <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                dirty <span class="token operator">=</span> <span class="token boolean">false</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> value
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> obj
<span class="token punctuation">}</span>
</code></pre></div><p>\u8FD9\u6837\uFF0C\u5C31\u5B9E\u73B0\u4E86\u6211\u4EEC\u60F3\u8981\u7684\u6548\u679C\uFF0C\u4F46\u8FD8\u5B58\u5728\u4E00\u4E2A\u7F3A\u9677\uFF0C\u770B\u4E0B\u9762\u4EE3\u7801</p><div class="language-js"><pre><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
    <span class="token literal-property property">b</span><span class="token operator">:</span> <span class="token number">2</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token function">proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
    
<span class="token keyword">const</span> count <span class="token operator">=</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> obj<span class="token punctuation">.</span>a <span class="token operator">+</span> obj<span class="token punctuation">.</span>b
<span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>count<span class="token punctuation">.</span>value<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
obj<span class="token punctuation">.</span>a <span class="token operator">=</span> <span class="token number">10</span>
</code></pre></div><p>\u4E0A\u9762\u4EE3\u7801\u6211\u4EEC\u671F\u671B\u7684\u6267\u884C\u7ED3\u679C\u662F</p><div class="language-"><pre><code>3
12
</code></pre></div><p>\u4F46\u5B9E\u9645\u6267\u884C\u7ED3\u679C\u786E\u5B9E</p><div class="language-"><pre><code>12
</code></pre></div><p>\u5F88\u660E\u663E\uFF0C\u5F53\u6211\u4EEC\u4FEE\u6539 obj.a \u7684\u503C\u65F6\uFF0Ceffect \u51FD\u6570\u5E76\u6CA1\u6709\u91CD\u65B0\u6267\u884C\u3002</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>count<span class="token punctuation">.</span>value<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5206\u6790\u539F\u56E0\uFF0C\u4E0A\u9762\u4EE3\u7801\u76F8\u5F53\u4E8E\u662F\u4E00\u4E2A effect \u51FD\u6570\u5D4C\u5957\u3002\u8BA1\u7B97\u5C5E\u6027 count \u62E5\u6709\u5B83\u81EA\u5DF1\u7684 effect \uFF0C\u5E76\u4E14\u662F\u61D2\u6267\u884C\u7684\uFF0C\u53EA\u6709\u8BFB\u53D6\u8BA1\u7B97\u5C5E\u6027\u7684\u503C\u65F6\u624D\u4F1A\u6267\u884C\u3002\u5728\u83B7\u53D6 count.value \u7684\u65F6\u5019\uFF0C\u4F1A\u89E6\u53D1 computed \u5185\u90E8\u7684 effectFn\uFF0C\u800C getter \u53EA\u4F1A\u6536\u96C6\u8BA1\u7B97\u5C5E\u6027\u5185\u90E8\u7684\u4F9D\u8D56\u6536\u96C6\u3002\u6267\u884C\u5B8C\u6BD5\u540E\uFF0C\u5E76\u6CA1\u6709\u628A\u5916\u5C42\u7684 effct \u6536\u96C6\u8FDB\u6765\u3002\u6240\u4EE5\u5F53 obj.a \u4FEE\u6539\u65F6\uFF0C\u5E76\u4E0D\u4F1A\u89E6\u53D1\u5916\u5C42 effect \u51FD\u6570\u7684\u6267\u884C</p><p>\u89E3\u51B3\u529E\u6CD5\u5F88\u7B80\u5355\uFF0C\u53EA\u9700\u8981\u5728\u8BBF\u95EE\u8BA1\u7B97\u5C5E\u6027\u7684\u65F6\u5019\uFF0C\u628A\u5916\u5C42\u7684\u526F\u4F5C\u7528\u51FD\u6570\u7ED9\u6DFB\u52A0\u5230\u4F9D\u8D56\u4E2D\uFF0C\u5F53\u4FEE\u6539\u8BA1\u7B97\u5C5E\u6027\u5185\u90E8\u7684\u4F9D\u8D56\uFF08\u5982\u4E0A\u9762\u7684 obj.a \u3001 obj.b\uFF09\u65F6\uFF0C\u89E6\u53D1\u526F\u4F5C\u7528\u51FD\u6570\u7684\u6267\u884C\u5373\u53EF</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token parameter">getter</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> value
    <span class="token keyword">let</span> dirty <span class="token operator">=</span> <span class="token boolean">true</span>
    <span class="token keyword">const</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            dirty <span class="token operator">=</span> <span class="token boolean">true</span>
            <span class="token comment">// \u8BA1\u7B97\u5C5E\u6027\u503C\u53D1\u751F\u6539\u53D8\uFF0C\u89E6\u53D1\u53D8\u5316\uFF0C\u6267\u884C\u5916\u5C42\u7684\u526F\u4F5C\u7528\u51FD\u6570</span>
            <span class="token function">trigger</span><span class="token punctuation">(</span>obj<span class="token punctuation">,</span> <span class="token string">&#39;value&#39;</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>dirty<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                value <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                dirty <span class="token operator">=</span> <span class="token boolean">false</span>
            <span class="token punctuation">}</span>
            <span class="token comment">// \u8BBF\u95EE\u65F6\uFF0C\u6536\u96C6\u5916\u5C42\u7684\u526F\u4F5C\u7528\u51FD\u6570</span>
            <span class="token function">track</span><span class="token punctuation">(</span>obj<span class="token punctuation">,</span> <span class="token string">&#39;value&#39;</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span> value
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> obj
<span class="token punctuation">}</span>
</code></pre></div><p>\u5B83\u4F1A\u5EFA\u7ACB\u8FD9\u6837\u7684\u8054\u7CFB</p><div class="language-"><pre><code>computed
  \u2514\u2500\u2500 value
       \u2514\u2500\u2500 effectFn
</code></pre></div><h2 id="watch" tabindex="-1">watch <a class="header-anchor" href="#watch" aria-hidden="true">#</a></h2><h3 id="watch\u7684\u5B9E\u73B0\u539F\u7406" tabindex="-1">watch\u7684\u5B9E\u73B0\u539F\u7406 <a class="header-anchor" href="#watch\u7684\u5B9E\u73B0\u539F\u7406" aria-hidden="true">#</a></h3><p>watch \u5C31\u662F\u76D1\u542C\u4E00\u4E2A\u54CD\u5E94\u5F0F\u6570\u636E\u7684\u53D8\u5316\uFF0C\u5F53\u6570\u636E\u53D1\u751F\u53D8\u5316\u65F6\uFF0C\u901A\u77E5\u5E76\u6267\u884C\u76F8\u5E94\u7684\u56DE\u8C03</p><div class="language-js"><pre><code><span class="token function">watch</span><span class="token punctuation">(</span>obj<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;obj \u53D1\u751F\u53D8\u5316\u4E86&#39;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
obj<span class="token punctuation">.</span>foo<span class="token operator">++</span>
</code></pre></div><p>watch \u65B9\u6CD5\u672C\u8D28\u4E0A\u5C31\u662F\u5229\u7528\u4E86 effect \u4EE5\u53CA options.scheduler</p><div class="language-js"><pre><code><span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>obj<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
    <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u4E0B\u9762\u5B9E\u73B0\u4E00\u4E2A\u6700\u7B80\u5355\u7684 watch \u65B9\u6CD5</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">watch</span><span class="token punctuation">(</span><span class="token parameter">obj<span class="token punctuation">,</span> cb</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> obj<span class="token punctuation">.</span>foo<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">cb</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u4F7F\u7528\u4E0A\u9762\u5B9E\u73B0\u7684 watch \u51FD\u6570</p><div class="language-js"><pre><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token function">proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
<span class="token keyword">function</span> <span class="token function">watch</span><span class="token punctuation">(</span><span class="token parameter">obj<span class="token punctuation">,</span> cb</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> obj<span class="token punctuation">.</span>foo<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">cb</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
<span class="token function">watch</span><span class="token punctuation">(</span>obj<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;obj \u53D1\u751F\u4E86\u53D8\u5316&#39;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    obj<span class="token punctuation">.</span>foo <span class="token operator">=</span> <span class="token number">10</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">)</span>
</code></pre></div><p>\u8FD0\u884C\u4E0A\u9762\u4EE3\u7801\uFF0C\u53EF\u4EE5\u6B63\u5E38\u5DE5\u4F5C\uFF0C\u4F46\u6211\u4EEC\u5728watch \u65F6\uFF0C\u5199\u6B7B\u4E86 obj.foo \u7684\u8BFB\u53D6\u64CD\u4F5C\uFF0C\u6240\u4EE5\uFF0C\u73B0\u5728\u8FD8\u65E0\u6CD5\u76D1\u542C\u5230 obj \u4E0A\u5176\u4ED6\u5C5E\u6027\u7684\u53D8\u5316</p><p>\u4E3A\u4E86\u76D1\u542C\u5230 obj \u6240\u6709\u5C5E\u6027\u7684\u53D8\u5316\uFF0C\u6211\u4EEC\u9700\u8981\u5C01\u88C5\u4E00\u4E2A\u901A\u7528\u7684\u65B9\u6CD5\uFF0C\u8BFB\u53D6 obj \u4E0A\u6240\u6709\u7684\u5C5E\u6027\uFF0C\u8FD9\u6837\u5C31\u80FD\u591F\u76D1\u542C\u5230\u6240\u6709\u5C5E\u6027\u7684\u53D8\u5316\u4E86</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">traverse</span><span class="token punctuation">(</span>value<span class="token punctuation">,</span> seen <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token comment">// seen.has(value)) \u7684\u4F5C\u7528\u662F\u5224\u65AD\u662F\u5426\u8BFB\u53D6\u8FC7\u4E86\uFF0C\u907F\u514D\u4EA7\u751F\u6B7B\u5FAA\u73AF</span>
    <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token keyword">typeof</span> value <span class="token operator">!==</span> <span class="token string">&#39;object&#39;</span> <span class="token operator">||</span> value <span class="token operator">===</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> seen<span class="token punctuation">.</span><span class="token function">has</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token keyword">return</span>
    seen<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span>
    <span class="token comment">// \u8BFB\u53D6\u6BCF\u4E2A\u5C5E\u6027\uFF0C\u9012\u5F52\u8C03\u7528 traverse </span>
    <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token keyword">const</span> k <span class="token keyword">in</span> value<span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token function">traverse</span><span class="token punctuation">(</span>value<span class="token punctuation">[</span>k<span class="token punctuation">]</span><span class="token punctuation">,</span> seen<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> value
<span class="token punctuation">}</span>
<span class="token keyword">function</span> <span class="token function">watch</span><span class="token punctuation">(</span><span class="token parameter">obj<span class="token punctuation">,</span> cb</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">traverse</span><span class="token punctuation">(</span>obj<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">cb</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>watch \u65B9\u6CD5\u9664\u4E86\u80FD\u591F\u89C2\u6D4B\u54CD\u5E94\u5F0F\u6570\u636E\uFF0C\u8FD8\u53EF\u4EE5\u63A5\u6536\u4E00\u4E2A getter \u51FD\u6570\uFF0C\u5728 getter \u51FD\u6570\u5185\u90E8\u6307\u5B9A\u4F9D\u8D56\u9879</p><div class="language-js"><pre><code><span class="token function">watch</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> obj<span class="token punctuation">.</span>foo<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;obj.foo \u7684\u503C\u53D1\u751F\u4E86\u53D8\u5316&#39;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5B9E\u73B0\u4EE3\u7801\uFF1A</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">watch</span><span class="token punctuation">(</span><span class="token parameter">source<span class="token punctuation">,</span> cb</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> getter
    <span class="token comment">// \u5982\u679C\u662F\u51FD\u6570\uFF0C\u8BF4\u660E\u7528\u6237\u4F20\u9012\u7684\u662F getter  \u6709\u70B9\u7C7B\u4F3C\u6211\u4EEC\u7B2C\u4E00\u6B21\u5B9E\u73B0\u7684 watch \u65B9\u6CD5</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> source <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        getter <span class="token operator">=</span> source
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function-variable function">getter</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">traverse</span><span class="token punctuation">(</span>source<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">cb</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u5728 Vue \u4E2D\uFF0C\u4F7F\u7528 watch \u65B9\u6CD5\u8FD8\u53EF\u4EE5\u83B7\u53D6\u5230\u5BF9\u5E94\u5C5E\u6027\u7684\u65B0\u503C\u548C\u65E7\u503C</p><div class="language-js"><pre><code><span class="token function">watch</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> obj<span class="token punctuation">.</span>foo<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">newVal<span class="token punctuation">,</span> oldVal</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>newVal<span class="token punctuation">,</span> oldVal<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5B9E\u73B0\u4EE3\u7801\u5F88\u7B80\u5355</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">watch</span><span class="token punctuation">(</span><span class="token parameter">source<span class="token punctuation">,</span> cb</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> getter
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> source <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        getter <span class="token operator">=</span> source
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function-variable function">getter</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">traverse</span><span class="token punctuation">(</span>source<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">let</span> oldVal
    <span class="token keyword">let</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">let</span> newVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
            <span class="token function">cb</span><span class="token punctuation">(</span>oldVal<span class="token punctuation">,</span> newVal<span class="token punctuation">)</span>
            oldVal <span class="token operator">=</span> newVal
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token comment">//  \u7B2C\u4E00\u6B21\u6267\u884C\uFF0C oldVal\u5C31\u662F\u526F\u4F5C\u7528\u51FD\u6570\u7684\u8FD4\u56DE\u503C</span>
    oldVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u8FD9\u91CC\u4E2A\u4EBA\u8BA4\u4E3A\u52A0 lazy \u7684\u76EE\u7684\u662F\u4E3A\u4E86\u8BA9 getter \u5EF6\u8FDF\u6267\u884C\uFF0C\u5982\u679C\u4E0D\u52A0\uFF0C\u867D\u7136\u4E0D\u4F1A\u5F71\u54CD\u7ED3\u679C\uFF0C\u4F46\u662F effectFn \u4F1A\u6267\u884C\u591A\u6B21</p><h3 id="\u7ACB\u5373\u6267\u884C\u7684-watch-\u4E0E\u56DE\u8C03\u6267\u884C\u65F6\u673A" tabindex="-1">\u7ACB\u5373\u6267\u884C\u7684 watch \u4E0E\u56DE\u8C03\u6267\u884C\u65F6\u673A <a class="header-anchor" href="#\u7ACB\u5373\u6267\u884C\u7684-watch-\u4E0E\u56DE\u8C03\u6267\u884C\u65F6\u673A" aria-hidden="true">#</a></h3><p>watch \u51FD\u6570\u7684\u4E24\u4E2A\u7279\u6027</p><ul><li>\u7ACB\u5373\u6267\u884C\u7684\u56DE\u8C03\u51FD\u6570</li><li>\u56DE\u8C03\u51FD\u6570\u7684\u6267\u884C\u65F6\u673A</li></ul><p>\u7ACB\u5373\u6267\u884C\u7684\u56DE\u8C03\u51FD\u6570\uFF0C\u9ED8\u8BA4\u60C5\u51B5\u4E0B\uFF0C\u4E00\u4E2A\u56DE\u5230\u51FD\u6570\u53EA\u6709\u5728\u54CD\u5E94\u5F0F\u7684\u6570\u636E\u53D1\u751F\u53D8\u5316\u65F6\u624D\u6267\u884C</p><div class="language-js"><pre><code><span class="token comment">// \u53EA\u6709 obj \u53D1\u751F\u53D8\u5316\u65F6\u624D\u4F1A\u6267\u884C\u56DE\u8C03\u51FD\u6570</span>
<span class="token function">watch</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> obj<span class="token punctuation">.</span>foo<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;obj \u53D8\u5316\u4E86&#39;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5728 Vue.js \u4E2D\uFF0C\u53EF\u4EE5\u901A\u8FC7\u9009\u9879 immediate \u6765\u6307\u5B9A\u56DE\u8C03\u51FD\u6570\u662F\u5426\u9700\u8981\u7ACB\u5373\u6267\u884C</p><div class="language-js"><pre><code><span class="token function">watch</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> obj<span class="token punctuation">.</span>foo<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;obj \u53D8\u5316\u4E86&#39;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">immediate</span><span class="token operator">:</span> <span class="token boolean">true</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5F53 immediate \u9009\u9879\u4E3A true \u65F6\uFF0C\u56DE\u8C03\u51FD\u6570\u5C31\u4F1A\u5728 watch \u521B\u5EFA\u65F6\u7ACB\u5373\u6267\u884C\u4E00\u6B21\uFF0C\u8DDF\u540E\u7EED\u6267\u884C\u6CA1\u6709\u533A\u522B\u3002\u6211\u4EEC\u5C06 scheduler \u8C03\u5EA6\u51FD\u6570\u5C01\u88C5\u8D77\u6765\uFF0C \u5F53\u6211\u4EEC\u4F20\u9012 immediate \u9009\u9879\u65F6\uFF0C\u76F4\u63A5\u8C03\u7528\u5B83\u5C31\u884C\u4E86\u3002</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">watch</span><span class="token punctuation">(</span><span class="token parameter">source<span class="token punctuation">,</span> cb<span class="token punctuation">,</span> options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> getter
    <span class="token keyword">let</span> oldVal
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> source <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        getter <span class="token operator">=</span> source
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function-variable function">getter</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">traverse</span><span class="token punctuation">(</span>source<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">function</span> <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">let</span> newVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token function">cb</span><span class="token punctuation">(</span>oldVal<span class="token punctuation">,</span> newVal<span class="token punctuation">)</span>
        oldVal <span class="token operator">=</span> newVal
    <span class="token punctuation">}</span>
    <span class="token keyword">let</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token literal-property property">scheduler</span><span class="token operator">:</span> job
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>options<span class="token punctuation">.</span>immediate<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        oldVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u6267\u884C\u4EE3\u7801\u540E\uFF0C\u7B2C\u4E00\u6B21\u6267\u884C\u56DE\u8C03\u7684 oldValue \u662F undefined \u56E0\u4E3A\u7B2C\u4E00\u6B21\u6267\u884C\u6CA1\u6709\u6240\u8C13\u7684\u65E7\u503C\uFF0C\u6240\u4EE5\u8FD9\u7B26\u5408\u6211\u4EEC\u7684\u9884\u671F</p><p>Vue \u4E2D\u8FD8\u53EF\u4EE5\u6307\u5B9A\u5176\u4ED6\u9009\u9879\u6765\u6307\u5B9A\u56DE\u8C03\u7684\u6267\u884C\u65F6\u673A\uFF0C\u4F8B\u5982\u5728 Vue \u4E2D\u4F7F\u7528 flush \u9009\u9879</p><div class="language-js"><pre><code><span class="token function">watch</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> obj<span class="token punctuation">.</span>foo<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">newVal<span class="token punctuation">,</span> old</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;obj.foo \u7684\u503C\u53D1\u751F\u4E86\u53D8\u5316&#39;</span><span class="token punctuation">)</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>newVal<span class="token punctuation">,</span> old<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">flush</span><span class="token operator">:</span> <span class="token string">&#39;pre&#39;</span> <span class="token comment">// \u8FD8\u53EF\u6307\u5B9A\u4E3A &#39;post&#39; \u548C &#39;sync&#39;</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>flush \u662F\u7528\u6765\u6307\u5B9A\u8C03\u5EA6\u51FD\u6570\u7684\u6267\u884C\u65F6\u673A\u3002 flush \u7684\u503C\u4E3A &#39;post&#39; \u65F6\uFF0C\u4EE3\u8868\u8C03\u5EA6\u51FD\u6570\u9700\u8981\u5C06\u526F\u4F5C\u7528\u51FD\u6570\u653E\u5230\u4E00\u4E2A\u5FAE\u4EFB\u52A1\u961F\u5217\u4E2D</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">watch</span><span class="token punctuation">(</span><span class="token parameter">source<span class="token punctuation">,</span> cb<span class="token punctuation">,</span> options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> getter
    <span class="token keyword">let</span> oldVal
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> source <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        getter <span class="token operator">=</span> source
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function-variable function">getter</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">traverse</span><span class="token punctuation">(</span>source<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">function</span> <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">let</span> newVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token function">cb</span><span class="token punctuation">(</span>oldVal<span class="token punctuation">,</span> newVal<span class="token punctuation">)</span>
        oldVal <span class="token operator">=</span> newVal
    <span class="token punctuation">}</span>
    <span class="token keyword">let</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// flush \u503C\u4E3A post \uFF0C\u5C06\u8C03\u5EA6\u51FD\u6570\u653E\u5230\u5F02\u6B65\u961F\u5217\u4E2D</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>options<span class="token punctuation">.</span>flush <span class="token operator">===</span> <span class="token string">&#39;post&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">const</span> p <span class="token operator">=</span> Promise<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                p<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>job<span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>options<span class="token punctuation">.</span>immediate<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        oldVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u5982\u4E0A\u9762\u4EE3\u7801\u6240\u793A\uFF0C \u4FEE\u6539\u4E86 scheduler \u7684\u5B9E\u73B0\u65B9\u5F0F\uFF0C\u5982\u679C\u6307\u5B9A flush \u503C\u4E3A post \uFF0C\u5C06\u5C06 job \u51FD\u6570\u653E\u5230\u5F02\u6B65\u961F\u5217\u4E2D\uFF0C\u4ECE\u800C\u5B9E\u73B0\u5EF6\u8FDF\u6267\u884C\uFF1B\u5426\u5219\u76F4\u63A5\u6267\u884C job \u51FD\u6570\uFF0C \u8FD9\u672C\u8D28\u4E0A\u5C31\u76F8\u5F53\u4E8E\u662F sync \u7684\u5B9E\u73B0\u673A\u5236\uFF08\u540C\u6B65\uFF09\u3002\u5BF9\u4E8E flush \u7684\u503C\u4E3A &#39;pre&#39;\uFF0C\u56E0\u4E3A\u6D89\u53CA\u7EC4\u4EF6\u7684\u66F4\u65B0\u673A\u5236\uFF0C\u8FD9\u91CC\u73B0\u5728\u8FD8\u6CA1\u529E\u6CD5\u6A21\u62DF</p><h3 id="\u8FC7\u671F\u7684\u526F\u4F5C\u7528" tabindex="-1">\u8FC7\u671F\u7684\u526F\u4F5C\u7528 <a class="header-anchor" href="#\u8FC7\u671F\u7684\u526F\u4F5C\u7528" aria-hidden="true">#</a></h3><p>\u5728\u5DE5\u4F5C\u53EF\u80FD\u4F1A\u9047\u5230\u8FD9\u6837\u7684\u573A\u666F</p><div class="language-js"><pre><code><span class="token function">watch</span><span class="token punctuation">(</span>obj<span class="token punctuation">,</span> <span class="token keyword">async</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token keyword">await</span> <span class="token function">fetch</span><span class="token punctuation">(</span><span class="token string">&#39;xxx&#39;</span><span class="token punctuation">)</span>
    finalData <span class="token operator">=</span> res
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5F53\u6211\u4EEC\u4FEE\u6539 obj.a \u7684\u503C\u65F6\uFF0C\u4F1A\u53D1\u9001\u4E00\u6B21\u8BF7\u6C42\uFF0C\u518D\u4FEE\u6539 obj.b \u7684\u503C\u65F6\uFF0C\u4F1A\u518D\u53D1\u9001\u4E00\u6B21\u8BF7\u6C42\uFF0C\u4F46\u662F\u6211\u4EEC\u5148\u53D1\u9001\u7684\u8BF7\u6C42\u53EF\u80FD\u4F1A\u540E\u63A5\u6536\u5230\u3002\u4F8B\u5982\u4FEE\u6539obj.b \u53D1\u9001\u7684\u8BF7\u6C42\u5148\u8FD4\u56DE\uFF0C\u8FD9\u5C31\u5BFC\u81F4 obj.a \u4F1A\u8FD4\u56DE\u7684\u6570\u636E\u4F1A\u8986\u76D6\u6389 obj.b \u8FD4\u56DE\u7684\u6570\u636E</p><p>\u5728 Vue.js \u4E2D\uFF0C watch \u51FD\u6570\u53EF\u4EE5\u6307\u5B9A\u63A5\u6536\u7B2C\u4E09\u4E2A\u53C2\u6570 onInvalidate ,\u5B83\u662F\u4E00\u4E2A\u51FD\u6570\uFF0C\u7C7B\u4F3C\u4E8E\u76D1\u542C\u5668\uFF0C\u6211\u4EEC\u53EF\u4EE5\u4F7F\u7528 onInvalidate \u51FD\u6570\u6CE8\u518C\u4E00\u4E2A\u56DE\u8C03\uFF0C\u8FD9\u4E2A\u56DE\u8C03\u51FD\u6570\u5C31\u4F1A\u5728\u5F53\u524D\u526F\u4F5C\u7528\u51FD\u6570\u8FC7\u671F\u65F6\u6267\u884C</p><div class="language-js"><pre><code><span class="token keyword">let</span> finaldata
<span class="token function">watch</span><span class="token punctuation">(</span>obj<span class="token punctuation">,</span> <span class="token keyword">async</span> <span class="token punctuation">(</span><span class="token parameter">newValue<span class="token punctuation">,</span> oldValue<span class="token punctuation">,</span> onInvalidate</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> expired <span class="token operator">=</span> <span class="token boolean">false</span>
    <span class="token function">onInvalidate</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        expired <span class="token operator">=</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token keyword">await</span> <span class="token function">getData</span><span class="token punctuation">(</span>newValue<span class="token punctuation">.</span>count<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>expired<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        finaldata <span class="token operator">=</span> res
    <span class="token punctuation">}</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>finaldate<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><p>\u5B9E\u73B0\u601D\u8DEF\u5C31\u662F\u6211\u4EEC\u7528\u6237\u8C03\u7528 onInvalidate \u540E\uFF0C\u6211\u4EEC\u5C06 onInvalidate \u7684\u56DE\u8C03\u7ED9\u4FDD\u5B58\u8D77\u6765\uFF0C\u5F53\u6570\u636E\u518D\u6B21\u53D1\u751F\u7684\u6539\u53D8\u65F6\uFF0C\u5C31\u4F1A\u8C03\u7528\u8BE5\u56DE\u8C03\u51FD\u6570\uFF08\u5373\u6267\u884C\u8FC7\u671F\u56DE\u8C03\uFF09</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">watch</span><span class="token punctuation">(</span><span class="token parameter">source<span class="token punctuation">,</span> cb<span class="token punctuation">,</span> options <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> getter
    <span class="token keyword">let</span> oldVal
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> source <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        getter <span class="token operator">=</span> source
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function-variable function">getter</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">traverse</span><span class="token punctuation">(</span>source<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token comment">// \u7528\u6765\u4FDD\u5B58\u8C03\u7528 onInvalidate \u4F20\u9012\u7684\u56DE\u8C03 \u5373\u8FC7\u671F\u56DE\u8C03</span>
    <span class="token keyword">let</span> cleanup
    <span class="token keyword">function</span> <span class="token function">onInvalidate</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        cleanup <span class="token operator">=</span> fn
    <span class="token punctuation">}</span>
    <span class="token keyword">function</span> <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">let</span> newVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

        <span class="token comment">// \u8C03\u7528\u4E0A\u6B21\u4F20\u9012\u7684\u56DE\u8C03\u5373\u8FC7\u671F\u56DE\u8C03</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span>cleanup<span class="token punctuation">)</span><span class="token punctuation">{</span>
            <span class="token function">cleanup</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
        <span class="token function">cb</span><span class="token punctuation">(</span>oldVal<span class="token punctuation">,</span> newVal<span class="token punctuation">,</span> onInvalidate<span class="token punctuation">)</span>
        oldVal <span class="token operator">=</span> newVal
    <span class="token punctuation">}</span>
    <span class="token keyword">let</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>options<span class="token punctuation">.</span>flush <span class="token operator">===</span> <span class="token string">&#39;post&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">const</span> p <span class="token operator">=</span> Promise<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                p<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>job<span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>options<span class="token punctuation">.</span>immediate<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        oldVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div>`,241),u=[c];function l(k,i,r,f,d,g){return a(),s("div",null,u)}var b=n(e,[["render",l]]);export{w as __pageData,b as default};
