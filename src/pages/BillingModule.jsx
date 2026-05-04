import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { message, Spin, Modal, Input, InputNumber, Tooltip, Popconfirm } from 'antd';
import { DeleteOutlined, PlusOutlined, ShoppingCartOutlined, UserOutlined, PhoneOutlined, MailOutlined, EditOutlined, WhatsAppOutlined } from '@ant-design/icons';

const API_URL = 'http://localhost:5000/api';
const CAT = { Electronics:{bg:'rgba(77,150,255,.12)',color:'#4d96ff'}, Accessories:{bg:'rgba(108,99,255,.12)',color:'#6c63ff'}, Audio:{bg:'rgba(82,201,122,.12)',color:'#52c97a'}, General:{bg:'rgba(245,158,11,.12)',color:'#f59e0b'} };

// ── Field wrapper (defined outside component to prevent focus loss) ──────────
function F({label,err,children}){return(<div><label className='field-label' style={{color:err?'#ef4444':undefined}}>{label}{err&&<span style={{color:'#ef4444',fontSize:11,fontWeight:500,marginLeft:8}}>{err}</span>}</label>{children}</div>);}

// ── Validation ──────────────────────────────────────────────
// Phone: exactly 10 digits (after stripping spaces/dashes/+91 prefix)
const validatePhone = v => {
  if (!v || !v.trim()) return true; // optional
  const digits = v.replace(/[\s\-()]/g, '').replace(/^\+91/, '').replace(/^0/, '');
  return /^\d{10}$/.test(digits);
};
// WhatsApp: same as phone — exactly 10 digits
const validateWhatsApp = v => {
  if (!v || !v.trim()) return true;
  const digits = v.replace(/[\s\-()]/g, '').replace(/^\+91/, '').replace(/^0/, '');
  return /^\d{10}$/.test(digits);
};
// Email: must contain @
const validateEmail = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// ── ProductCard ──────────────────────────────────────────────
function ProductCard({ product, onAddToCart, onEdit, onDelete }) {
  const [qty, setQty] = React.useState(1);
  const cat = CAT[product.category] || CAT.General;
  return (
    <div className='product-card'>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#ff6b6b,#ffd93d,#52c97a,#4d96ff)'}} />
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div className='product-cat' style={{background:cat.bg,color:cat.color,margin:0}}>{product.category}</div>
        <div style={{display:'flex',gap:6}}>
          <Tooltip title='Edit'><button onClick={e=>{e.stopPropagation();onEdit(product);}} style={{width:26,height:26,borderRadius:7,border:'1.5px solid var(--border)',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)',fontSize:12,transition:'all .2s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#6c63ff';e.currentTarget.style.color='#6c63ff';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)';}}>< EditOutlined /></button></Tooltip>
          <Popconfirm title='Delete this product?' description='This cannot be undone.' onConfirm={()=>onDelete(product.id)} okText='Delete' cancelText='Cancel' okButtonProps={{danger:true}}><Tooltip title='Delete'><button onClick={e=>e.stopPropagation()} style={{width:26,height:26,borderRadius:7,border:'1.5px solid var(--border)',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)',fontSize:12,transition:'all .2s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ff6b6b';e.currentTarget.style.color='#ff6b6b';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)';}}>< DeleteOutlined /></button></Tooltip></Popconfirm>
        </div>
      </div>
      <div className='product-name'>{product.name}</div>
      <div className='product-price'>Rs.{product.price.toLocaleString('en-IN')}</div>
      <div className='qty-row'>
        <button className='qty-btn' onClick={()=>setQty(q=>Math.max(1,q-1))}>-</button>
        <input type='number' min='1' value={qty} onChange={e=>setQty(Math.max(1,parseInt(e.target.value)||1))} className='qty-input' />
        <button className='qty-btn' onClick={()=>setQty(q=>q+1)}>+</button>
      </div>
      <button className='add-btn' onClick={()=>{onAddToCart(product,qty);setQty(1);}}>+ Add to Cart</button>
    </div>
  );
}

function BillingModule() {
  const [products,setProducts]=useState([]);
  const [cartItems,setCartItems]=useState([]);
  const [customerName,setCustomerName]=useState('');
  const [customerPhone,setCustomerPhone]=useState('');
  const [customerEmail,setCustomerEmail]=useState('');
  const [whatsapp,setWhatsapp]=useState('');
  const [taxAmount,setTaxAmount]=useState(0);
  const [discountAmount,setDiscountAmount]=useState(0);
  const [paymentMethod,setPaymentMethod]=useState('Cash');
  const [loading,setLoading]=useState(true);
  const [submitting,setSubmitting]=useState(false);
  const [errors,setErrors]=useState({});
  const [showAdd,setShowAdd]=useState(false);
  const [newProd,setNewProd]=useState({name:'',price:0,category:'General',stock:0});
  const [prodErrors,setProdErrors]=useState({});
  const [showEdit,setShowEdit]=useState(false);
  const [editProd,setEditProd]=useState(null);
  const [editErrors,setEditErrors]=useState({});
  const [sendingWA,setSendingWA]=useState(false);

  useEffect(()=>{fetchProducts();},[]);

  const fetchProducts=async()=>{
    try{const token=localStorage.getItem('token');const res=await axios.get(API_URL+'/products',{headers:{Authorization:'Bearer '+token}});setProducts(res.data);}catch{message.error('Failed to load products');}finally{setLoading(false);}
  };

  // Cart helpers
  const addToCart=(product,qty)=>{if(qty<=0){message.warning('Enter valid qty');return;}const ex=cartItems.find(i=>i.product_id===product.id);if(ex){setCartItems(cartItems.map(i=>i.product_id===product.id?{...i,quantity:i.quantity+qty,total_price:(i.quantity+qty)*i.unit_price}:i));}else{setCartItems([...cartItems,{product_id:product.id,product_name:product.name,unit_price:product.price,quantity:qty,total_price:product.price*qty}]);}message.success(product.name+' added');};
  const removeFromCart=id=>setCartItems(cartItems.filter(i=>i.product_id!==id));
  const updateQty=(id,qty)=>{if(qty<=0){removeFromCart(id);return;}setCartItems(cartItems.map(i=>i.product_id===id?{...i,quantity:qty,total_price:qty*i.unit_price}:i));};
  const subtotal=cartItems.reduce((s,i)=>s+i.total_price,0);
  const total=subtotal+taxAmount-discountAmount;

  // Validate customer form
  const validateForm=()=>{
    const e={};
    if(!customerName.trim()) e.customerName='Customer name is required';
    else if(!/^[a-zA-Z\s.'-]{2,}$/.test(customerName.trim())) e.customerName='Name must contain only letters (no numbers)';
    if(customerPhone.trim() && !validatePhone(customerPhone)) e.customerPhone='Enter a valid 10-digit phone number';
    if(customerEmail.trim() && !validateEmail(customerEmail)) e.customerEmail='Email must contain @ (e.g. name@email.com)';
    if(whatsapp.trim() && !validateWhatsApp(whatsapp)) e.whatsapp='Enter a valid 10-digit WhatsApp number';
    setErrors(e);
    return Object.keys(e).length===0;
  };

  // Create bill + WhatsApp PDF send
  const handleCreateBill=async()=>{if(!validateForm())return;if(cartItems.length===0){message.error('Add items to the bill');return;}setSubmitting(true);try{const token=localStorage.getItem('token');const res=await axios.post(API_URL+'/invoices',{customer_name:customerName,customer_phone:customerPhone,customer_email:customerEmail,items:cartItems,tax_amount:taxAmount,discount_amount:discountAmount,payment_method:paymentMethod},{headers:{Authorization:'Bearer '+token}});message.success('Bill created!');setTimeout(()=>downloadPDF(res.data.id,res.data.invoice_number),500);if(whatsapp.trim()){setTimeout(()=>sendWhatsAppPDF(res.data.id,res.data.invoice_number,whatsapp.trim()),1500);}setCustomerName('');setCustomerPhone('');setCustomerEmail('');setWhatsapp('');setCartItems([]);setTaxAmount(0);setDiscountAmount(0);setPaymentMethod('Cash');setErrors({});}catch(err){message.error(err.response?.data?.error||'Failed to create bill');}finally{setSubmitting(false);}};

  const downloadPDF=async(invoiceId,invoiceNumber)=>{try{const token=localStorage.getItem('token');const res=await fetch(API_URL+'/invoices/'+invoiceId+'/pdf',{headers:{Authorization:'Bearer '+token}});const blob=await res.blob();const url=window.URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='invoice-'+(invoiceNumber||invoiceId)+'.pdf';document.body.appendChild(a);a.click();window.URL.revokeObjectURL(url);document.body.removeChild(a);}catch{message.error('Failed to download PDF');}};

  // WhatsApp: fetch PDF as base64, create blob URL, open WhatsApp with file
  const sendWhatsAppPDF=async(invoiceId,invoiceNumber,phone)=>{setSendingWA(true);try{const token=localStorage.getItem('token');const res=await axios.get(API_URL+'/invoices/'+invoiceId+'/pdf-base64',{headers:{Authorization:'Bearer '+token}});const {base64,filename}=res.data;const byteChars=atob(base64);const byteArr=new Uint8Array(byteChars.length);for(let i=0;i<byteChars.length;i++)byteArr[i]=byteChars.charCodeAt(i);const blob=new Blob([byteArr],{type:'application/pdf'});const blobUrl=window.URL.createObjectURL(blob);let cleaned=phone.replace(/[\s\-()]/g,'');if(!cleaned.startsWith('+'))cleaned=cleaned.startsWith('0')?'+91'+cleaned.slice(1):'+91'+cleaned;cleaned=cleaned.replace('+','');const msg=encodeURIComponent('Hello! Your invoice *'+invoiceNumber+'* from *Look @ me* is ready.\n\nPlease find your PDF invoice attached.\n\nThank you for your business!');const waUrl='https://wa.me/'+cleaned+'?text='+msg;window.open(waUrl,'_blank');const a=document.createElement('a');a.href=blobUrl;a.download=filename;document.body.appendChild(a);a.click();window.URL.revokeObjectURL(blobUrl);document.body.removeChild(a);message.success({content:'PDF downloaded to your device! WhatsApp is opening - please attach the PDF file in the chat.',duration:6});}catch{message.error('Failed to prepare WhatsApp send');}finally{setSendingWA(false);}};

  // Product CRUD
  const validateProd=(d,setE)=>{const e={};if(!d.name||d.name.trim().length<2)e.name='Product name must be at least 2 characters';if(!d.price||d.price<=0)e.price='Price must be greater than 0';if(!d.category||d.category.trim().length<2)e.category='Category is required';setE(e);return Object.keys(e).length===0;};
  const addNewProduct=async()=>{if(!validateProd(newProd,setProdErrors))return;try{const token=localStorage.getItem('token');await axios.post(API_URL+'/products',newProd,{headers:{Authorization:'Bearer '+token}});message.success('Product added!');setShowAdd(false);setNewProd({name:'',price:0,category:'General',stock:0});setProdErrors({});fetchProducts();}catch{message.error('Failed to add product');}};
  const saveEditProduct=async()=>{if(!validateProd(editProd,setEditErrors))return;try{const token=localStorage.getItem('token');await axios.put(API_URL+'/products/'+editProd.id,editProd,{headers:{Authorization:'Bearer '+token}});message.success('Product updated!');setShowEdit(false);setEditProd(null);setEditErrors({});fetchProducts();}catch{message.error('Failed to update product');}};
  const deleteProduct=async(id)=>{try{const token=localStorage.getItem('token');await axios.delete(API_URL+'/products/'+id,{headers:{Authorization:'Bearer '+token}});message.success('Product deleted!');fetchProducts();}catch{message.error('Failed to delete product');}};

  const payMethods=[{key:'Cash',icon:'💵',color:'#52c97a'},{key:'Card',icon:'💳',color:'#4d96ff'},{key:'UPI',icon:'📱',color:'#6c63ff'},{key:'Cheque',icon:'📝',color:'#f59e0b'}];

  if(loading)return(<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:400}}><Spin size='large'/></div>);

  // F is defined outside this component to prevent focus loss

  return (
    <div style={{maxWidth:1400,margin:'0 auto',width:'100%',minWidth:0}}>
      <div className='billing-grid'>
        <div style={{display:'flex',flexDirection:'column',gap:22}}>
          <div className='card'>
            <div className='card-header'><div style={{display:'flex',alignItems:'center',gap:12}}><div className='icon-badge' style={{background:'linear-gradient(135deg,#667eea,#764ba2)',width:40,height:40,borderRadius:12,fontSize:18}}><UserOutlined/></div><div><div className='card-title'>Customer Details</div><div className='card-sub'>Enter customer information</div></div></div></div>
            <div className='card-body'><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18}}>
              <F label='Customer Name *' err={errors.customerName}><div className='field-wrap'><span className='field-icon'><UserOutlined/></span><input type='text' value={customerName} onChange={e=>{const v=e.target.value.replace(/[0-9]/g,'');setCustomerName(v);if(errors.customerName)setErrors({...errors,customerName:''});}} placeholder='Full name (letters only)' className='field-input' style={{borderColor:errors.customerName?'#ef4444':undefined}}/></div></F>
              <F label='Phone Number (10 digits)' err={errors.customerPhone}><div className='field-wrap'><span className='field-icon'><PhoneOutlined/></span><input type='tel' value={customerPhone} onChange={e=>{const v=e.target.value.replace(/[^\d\s\-+()\+]/g,'');setCustomerPhone(v);if(errors.customerPhone)setErrors({...errors,customerPhone:''});}} placeholder='98765 43210' className='field-input' style={{borderColor:errors.customerPhone?'#ef4444':undefined}} maxLength={15}/></div></F>
              <F label='Email Address' err={errors.customerEmail}><div className='field-wrap'><span className='field-icon'><MailOutlined/></span><input type='email' value={customerEmail} onChange={e=>{setCustomerEmail(e.target.value);if(errors.customerEmail)setErrors({...errors,customerEmail:''});}} placeholder='name@email.com' className='field-input' style={{borderColor:errors.customerEmail?'#ef4444':undefined}}/></div></F>
              <F label={<span style={{display:'flex',alignItems:'center',gap:6}}><WhatsAppOutlined style={{color:'#25D366'}}/> WhatsApp (10 digits) <span style={{fontSize:11,color:'var(--muted)',fontWeight:400}}>(optional)</span></span>} err={errors.whatsapp}><div className='field-wrap'><span className='field-icon' style={{color:'#25D366'}}><WhatsAppOutlined/></span><input type='tel' value={whatsapp} onChange={e=>{const v=e.target.value.replace(/[^\d\s\-+()\+]/g,'');setWhatsapp(v);if(errors.whatsapp)setErrors({...errors,whatsapp:''});}} placeholder='98765 43210' className='field-input' style={{borderColor:errors.whatsapp?'#ef4444':whatsapp?'#25D366':undefined}} maxLength={15} onFocus={e=>{e.target.style.borderColor='#25D366';e.target.style.boxShadow='0 0 0 4px rgba(37,211,102,.1)';}} onBlur={e=>{e.target.style.borderColor=errors.whatsapp?'#ef4444':whatsapp?'#25D366':'var(--border)';e.target.style.boxShadow='none';}}/></div>{whatsapp&&!errors.whatsapp&&<p style={{fontSize:11,color:'#25D366',marginTop:5,fontWeight:600}}>PDF will be downloaded and WhatsApp will open to send it</p>}</F>
            </div></div>
          </div>
          <div className='card'>
            <div className='card-header'>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div className='icon-badge' style={{background:'linear-gradient(135deg,#4d96ff,#1e90ff)',width:40,height:40,borderRadius:12,fontSize:18}}><ShoppingCartOutlined/></div>
                <div><div className='card-title'>Select Products</div><div className='card-sub'>{products.length} products available</div></div>
              </div>
              <button onClick={()=>setShowAdd(true)} style={{padding:'9px 18px',background:'linear-gradient(135deg,#6c63ff,#764ba2)',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'Raleway,sans-serif',display:'flex',alignItems:'center',gap:7,boxShadow:'0 4px 12px rgba(108,99,255,.3)'}}><PlusOutlined/> New Product</button>
            </div>
            <div className='card-body'>
              <div className='products-grid'>
                {products.map(p=>(<ProductCard key={p.id} product={p} onAddToCart={addToCart} onEdit={p2=>{setEditProd({...p2});setShowEdit(true);}} onDelete={deleteProduct}/>))}
              </div>
            </div>
          </div>
        </div>
        <div className='cart-panel'>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <div className='icon-badge' style={{background:'linear-gradient(135deg,#56ab2f,#a8e063)',width:40,height:40,borderRadius:12,fontSize:18}}><ShoppingCartOutlined/></div>
            <div><div className='card-title'>Bill Summary</div><div className='card-sub'>{cartItems.length} item(s)</div></div>
          </div>
          {cartItems.length===0?(
            <div className='cart-empty'><div className='cart-empty-icon'>🛒</div><p style={{fontSize:15,fontWeight:600,marginBottom:6}}>Cart is empty</p><p style={{fontSize:13}}>Add products from the left</p></div>
          ):(<>
            <div className='cart-items-list'>{cartItems.map(item=>(<div key={item.product_id} className='cart-item'><div className='cart-item-info'><div className='cart-item-name'>{item.product_name}</div><div className='cart-item-unit'>Rs.{item.unit_price.toLocaleString('en-IN')} each</div></div><div style={{display:'flex',alignItems:'center',gap:6}}><button onClick={()=>updateQty(item.product_id,item.quantity-1)} style={{width:24,height:24,borderRadius:6,border:'1px solid var(--border)',background:'#fff',cursor:'pointer',fontWeight:700,color:'var(--primary)',fontSize:14}}>-</button><span style={{fontSize:13,fontWeight:700,minWidth:22,textAlign:'center'}}>{item.quantity}</span><button onClick={()=>updateQty(item.product_id,item.quantity+1)} style={{width:24,height:24,borderRadius:6,border:'1px solid var(--border)',background:'#fff',cursor:'pointer',fontWeight:700,color:'var(--primary)',fontSize:14}}>+</button></div><div className='cart-item-total'>Rs.{item.total_price.toLocaleString('en-IN')}</div><button className='cart-del-btn' onClick={()=>removeFromCart(item.product_id)}><DeleteOutlined/></button></div>))}</div>
            <div className='cart-summary'>
              <div className='summary-row'><span>Subtotal</span><span style={{fontWeight:700,color:'var(--text)'}}>Rs.{subtotal.toLocaleString('en-IN')}</span></div>
              <div className='summary-row'><span>Tax (Rs.)</span><input type='number' min='0' value={taxAmount} onChange={e=>setTaxAmount(parseFloat(e.target.value)||0)} className='summary-input' onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
              <div className='summary-row'><span>Discount (Rs.)</span><input type='number' min='0' value={discountAmount} onChange={e=>setDiscountAmount(parseFloat(e.target.value)||0)} className='summary-input' onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
            </div>
            <div className='cart-total'><span className='cart-total-label'>Total Amount</span><span className='cart-total-value'>Rs.{total.toLocaleString('en-IN')}</span></div>
            {whatsapp&&!errors.whatsapp&&(<div style={{background:'rgba(37,211,102,.08)',border:'1.5px solid rgba(37,211,102,.3)',borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:8}}><WhatsAppOutlined style={{color:'#25D366',fontSize:16}}/><span style={{fontSize:12,color:'#25D366',fontWeight:700}}>PDF will be sent to {whatsapp}</span></div>)}
            <p style={{fontSize:12,fontWeight:700,color:'var(--muted)',marginBottom:10,textTransform:'uppercase',letterSpacing:'.5px'}}>Payment Method</p>
            <div className='payment-grid'>{payMethods.map(pm=>(<button key={pm.key} className='pay-btn' onClick={()=>setPaymentMethod(pm.key)} style={{border:paymentMethod===pm.key?'2px solid '+pm.color:'2px solid var(--border)',background:paymentMethod===pm.key?pm.color+'15':'#fff',color:paymentMethod===pm.key?pm.color:'var(--muted)'}}>{pm.icon} {pm.key}</button>))}</div>
            <button className='create-btn' onClick={handleCreateBill} disabled={submitting||sendingWA}>{submitting?'Creating...':(sendingWA?'Sending to WhatsApp...':(whatsapp?'Create, Download & Send on WhatsApp':'Create & Download Bill'))}</button>
            <button className='clear-btn' onClick={()=>setCartItems([])}>Clear Cart</button>
          </>)}
        </div>
      </div>
      <Modal title={<span style={{fontWeight:700,fontSize:16}}>Add New Product</span>} open={showAdd} onOk={addNewProduct} onCancel={()=>{setShowAdd(false);setProdErrors({});}} okText='Add Product' okButtonProps={{style:{background:'linear-gradient(135deg,#667eea,#764ba2)',border:'none',fontWeight:700}}}><ProdForm data={newProd} onChange={setNewProd} errs={prodErrors}/></Modal>
      <Modal title={<span style={{fontWeight:700,fontSize:16}}>Edit Product</span>} open={showEdit} onOk={saveEditProduct} onCancel={()=>{setShowEdit(false);setEditErrors({});}} okText='Save Changes' okButtonProps={{style:{background:'linear-gradient(135deg,#f59e0b,#ef4444)',border:'none',fontWeight:700}}}>{editProd&&<ProdForm data={editProd} onChange={setEditProd} errs={editErrors}/>}</Modal>
    </div>
  );
}

/* ── Field error wrapper for modals (outside component to prevent focus loss) ── */
function E({label,err,children}){
  return(
    <div style={{marginBottom:4}}>
      <label className='field-label' style={{color:err?'#ef4444':undefined}}>
        {label}{err&&<span style={{color:'#ef4444',fontSize:11,fontWeight:500,marginLeft:8}}>{err}</span>}
      </label>
      {children}
    </div>
  );
}

function ProdForm({data,onChange,errs}) {
  return (<div style={{display:'flex',flexDirection:'column',gap:16,paddingTop:8}}>
    <E label='Product Name *' err={errs.name}><Input value={data.name} onChange={e=>onChange({...data,name:e.target.value})} placeholder='e.g. Wireless Mouse' size='large' status={errs.name?'error':''}/></E>
    <E label='Price (Rs.) *' err={errs.price}><InputNumber value={data.price} onChange={v=>onChange({...data,price:v||0})} min={0} style={{width:'100%'}} size='large' status={errs.price?'error':''} formatter={v=>'Rs. '+v} parser={v=>v.replace(/Rs\.\s?/,'')}/></E>
    <E label='Category *' err={errs.category}><Input value={data.category} onChange={e=>onChange({...data,category:e.target.value})} placeholder='e.g. Electronics' size='large' status={errs.category?'error':''}/></E>
    <E label='Stock Quantity'><InputNumber value={data.stock} onChange={v=>onChange({...data,stock:v||0})} min={0} style={{width:'100%'}} size='large'/></E>
  </div>);
}

export default BillingModule;
