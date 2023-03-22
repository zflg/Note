import{ab as n,H as s,I as a,ad as e}from"./framework-6d9bedb0.js";const t={},p=e(`<h2 id="一个简单的智能合约" tabindex="-1"><a class="header-anchor" href="#一个简单的智能合约" aria-hidden="true">#</a> 一个简单的智能合约</h2><h3 id="存储示例" tabindex="-1"><a class="header-anchor" href="#存储示例" aria-hidden="true">#</a> 存储示例</h3><div class="language-solidity line-numbers-mode" data-ext="solidity"><pre class="language-solidity"><code><span class="token comment">// SPDX-License-Identifier: GPL-3.0</span>
<span class="token keyword">pragma</span> <span class="token keyword">solidity</span> <span class="token operator">&gt;=</span><span class="token version number">0.4.16</span> <span class="token operator">&lt;</span><span class="token version number">0.9.0</span><span class="token punctuation">;</span>

<span class="token keyword">contract</span> <span class="token class-name">SimpleStorage</span> <span class="token punctuation">{</span>
    <span class="token builtin">uint</span> storedData<span class="token punctuation">;</span>

    <span class="token keyword">function</span> <span class="token function">set</span><span class="token punctuation">(</span><span class="token builtin">uint</span> x<span class="token punctuation">)</span> <span class="token keyword">public</span> <span class="token punctuation">{</span>
        storedData <span class="token operator">=</span> x<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">function</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">public</span> <span class="token keyword">view</span> <span class="token keyword">returns</span> <span class="token punctuation">(</span><span class="token builtin">uint</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> storedData<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以观察一下大概的结构：</p><ul><li>版本许可GLPL3.0</li><li>指定编译版本</li><li>代码正文</li></ul><p>Solidity意义上的合约是驻留在以太坊区块链上的特定地址的代码和数据集合。该示例申明了unit的状态变量，可以通过get和set查询和更改。</p><h3 id="子货币示例" tabindex="-1"><a class="header-anchor" href="#子货币示例" aria-hidden="true">#</a> 子货币示例</h3><p>以上合约没有施加访问限制，现在的示例施加的访问限制示只允许合约的创建者创建新币。</p><div class="language-solidity line-numbers-mode" data-ext="solidity"><pre class="language-solidity"><code><span class="token comment">// SPDX-License-Identifier: GPL-3.0</span>
<span class="token keyword">pragma</span> <span class="token keyword">solidity</span> <span class="token operator">^</span><span class="token version number">0.8.4</span><span class="token punctuation">;</span>

<span class="token keyword">contract</span> <span class="token class-name">Coin</span> <span class="token punctuation">{</span>
    <span class="token comment">// The keyword &quot;public&quot; makes variables</span>
    <span class="token comment">// accessible from other contracts</span>
    <span class="token builtin">address</span> <span class="token keyword">public</span> minter<span class="token punctuation">;</span>
    <span class="token keyword">mapping</span><span class="token punctuation">(</span><span class="token builtin">address</span> <span class="token operator">=&gt;</span> <span class="token builtin">uint</span><span class="token punctuation">)</span> <span class="token keyword">public</span> balances<span class="token punctuation">;</span>

    <span class="token comment">// Events allow clients to react to specific</span>
    <span class="token comment">// contract changes you declare</span>
    <span class="token keyword">event</span> <span class="token function">Sent</span><span class="token punctuation">(</span><span class="token builtin">address</span> <span class="token keyword">from</span><span class="token punctuation">,</span> <span class="token builtin">address</span> to<span class="token punctuation">,</span> <span class="token builtin">uint</span> amount<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// Constructor code is only run when the contract</span>
    <span class="token comment">// is created</span>
    <span class="token keyword">constructor</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        minter <span class="token operator">=</span> msg<span class="token punctuation">.</span>sender<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// Sends an amount of newly created coins to an address</span>
    <span class="token comment">// Can only be called by the contract creator</span>
    <span class="token keyword">function</span> <span class="token function">mint</span><span class="token punctuation">(</span><span class="token builtin">address</span> receiver<span class="token punctuation">,</span> <span class="token builtin">uint</span> amount<span class="token punctuation">)</span> <span class="token keyword">public</span> <span class="token punctuation">{</span>
        <span class="token keyword">require</span><span class="token punctuation">(</span>msg<span class="token punctuation">.</span>sender <span class="token operator">==</span> minter<span class="token punctuation">)</span><span class="token punctuation">;</span>
        balances<span class="token punctuation">[</span>receiver<span class="token punctuation">]</span> <span class="token operator">+=</span> amount<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// Errors allow you to provide information about</span>
    <span class="token comment">// why an operation failed. They are returned</span>
    <span class="token comment">// to the caller of the function.</span>
    error <span class="token function">InsufficientBalance</span><span class="token punctuation">(</span><span class="token builtin">uint</span> requested<span class="token punctuation">,</span> <span class="token builtin">uint</span> available<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// Sends an amount of existing coins</span>
    <span class="token comment">// from any caller to an address</span>
    <span class="token keyword">function</span> <span class="token function">send</span><span class="token punctuation">(</span><span class="token builtin">address</span> receiver<span class="token punctuation">,</span> <span class="token builtin">uint</span> amount<span class="token punctuation">)</span> <span class="token keyword">public</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>amount <span class="token operator">&gt;</span> balances<span class="token punctuation">[</span>msg<span class="token punctuation">.</span>sender<span class="token punctuation">]</span><span class="token punctuation">)</span>
            <span class="token keyword">revert</span> <span class="token function">InsufficientBalance</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
                requested<span class="token punctuation">:</span> amount<span class="token punctuation">,</span>
                available<span class="token punctuation">:</span> balances<span class="token punctuation">[</span>msg<span class="token punctuation">.</span>sender<span class="token punctuation">]</span>
            <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        balances<span class="token punctuation">[</span>msg<span class="token punctuation">.</span>sender<span class="token punctuation">]</span> <span class="token operator">-=</span> amount<span class="token punctuation">;</span>
        balances<span class="token punctuation">[</span>receiver<span class="token punctuation">]</span> <span class="token operator">+=</span> amount<span class="token punctuation">;</span>
        <span class="token keyword">emit</span> <span class="token function">Sent</span><span class="token punctuation">(</span>msg<span class="token punctuation">.</span>sender<span class="token punctuation">,</span> receiver<span class="token punctuation">,</span> amount<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>####minter变量（address类型） address类型的变量示一个160bit值并且不允许修改，适用于存储合约地址，或者示外部账户的公钥哈希。而public修饰会自动生成一个函数，并允许从合约外部访问这个值。</p><div class="language-solidity line-numbers-mode" data-ext="solidity"><pre class="language-solidity"><code><span class="token keyword">function</span> <span class="token function">minter</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">external</span> <span class="token keyword">view</span> <span class="token keyword">returns</span> <span class="token punctuation">(</span><span class="token builtin">address</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> minter<span class="token punctuation">;</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>####balances变量（mapping类型）</p>`,12),i=[p];function c(o,l){return s(),a("div",null,i)}const d=n(t,[["render",c],["__file","day1.html.vue"]]);export{d as default};
