<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [zotero-plugin-toolkit](./zotero-plugin-toolkit.md) &gt; [ItemTreeTool](./zotero-plugin-toolkit.itemtreetool.md)

## ItemTreeTool class

Tool for adding customized new columns to the library treeView

<b>Signature:</b>

```typescript
export declare class ItemTreeTool 
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)()](./zotero-plugin-toolkit.itemtreetool._constructor_.md) |  | <p>Initialize Zotero.\_ItemTreeExtraColumnsGlobal if it doesn't exist.</p><p>New columns and hooks are stored there.</p><p>Then patch <code>require(&quot;zotero/itemTree&quot;).getColumns</code> and <code>Zotero.Item.getField</code></p> |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [register(key, label, fieldHook, options)](./zotero-plugin-toolkit.itemtreetool.register.md) |  | Register a new column. Don't forget to call <code>unregister</code> on plugin exit. |
|  [registerExample()](./zotero-plugin-toolkit.itemtreetool.registerexample.md) |  | An example of registering an extra column |
|  [unregister(key)](./zotero-plugin-toolkit.itemtreetool.unregister.md) |  | Unregister an extra column. Call it on plugin exit. |
